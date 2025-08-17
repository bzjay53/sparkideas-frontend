#!/usr/bin/env python3
"""
Vercel Environment Variables Setup Script
Automatically configures Vercel with production environment variables
"""

import sys
import json
import subprocess
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Load environment variables first
import os
from dotenv import load_dotenv
load_dotenv(backend_path / ".env")

from app.config.env_manager import env_manager

class VercelEnvSetup:
    """Setup Vercel environment variables"""
    
    def __init__(self):
        self.env_manager = env_manager
        self.frontend_vars = self._get_frontend_vars()
        self.backend_vars = self._get_backend_vars()
    
    def _get_frontend_vars(self) -> dict:
        """Get frontend environment variables"""
        return {
            # Application Configuration
            "NEXT_PUBLIC_APP_NAME": "IdeaSpark v2.0",
            "NEXT_PUBLIC_APP_VERSION": "2.0.0",
            "NEXT_PUBLIC_APP_DESCRIPTION": "Real-time Pain Point Analysis & Business Idea Generation",
            
            # API Configuration
            "NEXT_PUBLIC_API_BASE_URL": "https://ideaSpark-backend.vercel.app",
            "NEXT_PUBLIC_API_VERSION": "v1",
            
            # Feature Flags
            "NEXT_PUBLIC_ENABLE_ANALYTICS": "true",
            "NEXT_PUBLIC_ENABLE_COMMUNITY": "true",
            "NEXT_PUBLIC_ENABLE_PRD_GENERATOR": "true",
            
            # UI Configuration
            "NEXT_PUBLIC_DEFAULT_THEME": "blue",
            "NEXT_PUBLIC_ENABLE_DARK_MODE": "true",
            
            # Environment
            "NEXT_PUBLIC_ENVIRONMENT": "production",
            "NEXT_PUBLIC_VERCEL_URL": "https://ideaSpark-frontend.vercel.app"
        }
    
    def _get_backend_vars(self) -> dict:
        """Get backend environment variables from env_manager"""
        return self.env_manager.export_config_for_vercel()
    
    def generate_vercel_commands(self) -> list:
        """Generate Vercel CLI commands for setting environment variables"""
        commands = []
        
        print("🔧 Generating Vercel Environment Variable Commands")
        print("=" * 60)
        
        # Frontend variables
        print("\n📱 Frontend Variables:")
        for key, value in self.frontend_vars.items():
            cmd = f'vercel env add {key} production'
            commands.append(f'echo "{value}" | {cmd}')
            print(f"  ✓ {key}")
        
        # Backend variables
        print("\n🖥️  Backend Variables:")
        for key, value in self.backend_vars.items():
            if value:  # Only add non-empty values
                cmd = f'vercel env add {key} production'
                commands.append(f'echo "{value}" | {cmd}')
                # Mask sensitive values in output
                display_value = self.env_manager.mask_sensitive_value(str(value))
                print(f"  ✓ {key}: {display_value}")
        
        return commands
    
    def create_env_file(self, file_path: str):
        """Create a .env file for manual setup"""
        with open(file_path, 'w') as f:
            f.write("# IdeaSpark Production Environment Variables\n")
            f.write("# Generated automatically - Deploy to Vercel\n\n")
            
            f.write("# Frontend Variables\n")
            for key, value in self.frontend_vars.items():
                f.write(f'{key}="{value}"\n')
            
            f.write("\n# Backend Variables\n")
            for key, value in self.backend_vars.items():
                if value:
                    f.write(f'{key}="{value}"\n')
        
        print(f"📄 Environment file created: {file_path}")
    
    def create_setup_script(self, script_path: str):
        """Create executable setup script"""
        commands = self.generate_vercel_commands()
        
        script_content = """#!/bin/bash
# IdeaSpark Vercel Environment Setup Script
# Run this script to configure all environment variables in Vercel

echo "🚀 Setting up IdeaSpark Environment Variables in Vercel..."
echo "=================================================="

# Make sure you're logged into Vercel
vercel whoami

# Set environment variables
"""
        
        for cmd in commands:
            script_content += f"{cmd}\n"
        
        script_content += """
echo ""
echo "✅ Environment variables setup completed!"
echo "🔗 You can verify them at: https://vercel.com/dashboard"
echo ""
echo "🚀 Ready to deploy IdeaSpark!"
"""
        
        with open(script_path, 'w') as f:
            f.write(script_content)
        
        # Make executable
        Path(script_path).chmod(0o755)
        print(f"📜 Setup script created: {script_path}")
    
    def validate_configuration(self):
        """Validate the environment configuration"""
        print("\n🔍 Validating Configuration...")
        print("=" * 40)
        
        issues = []
        
        # Check critical backend variables
        critical_vars = [
            "OPENAI_API_KEY", "REDDIT_CLIENT_ID", "GOOGLE_SEARCH_API_KEY", 
            "TELEGRAM_BOT_TOKEN", "NAVER_CLIENT_ID"
        ]
        
        for var in critical_vars:
            if not self.backend_vars.get(var):
                issues.append(f"Missing {var}")
        
        if issues:
            print("❌ Configuration Issues:")
            for issue in issues:
                print(f"  - {issue}")
            return False
        else:
            print("✅ All critical variables present")
            return True
    
    def print_summary(self):
        """Print setup summary"""
        frontend_count = len(self.frontend_vars)
        backend_count = len([v for v in self.backend_vars.values() if v])
        
        print(f"\n📊 Configuration Summary:")
        print(f"  Frontend variables: {frontend_count}")
        print(f"  Backend variables: {backend_count}")
        print(f"  Total variables: {frontend_count + backend_count}")
        
        print(f"\n🎯 Next Steps:")
        print(f"  1. Run: chmod +x setup_vercel_env.sh")
        print(f"  2. Run: ./setup_vercel_env.sh")
        print(f"  3. Deploy: vercel --prod")

def main():
    """Main setup function"""
    print("🔐 IdeaSpark Vercel Environment Setup")
    print("=" * 50)
    
    setup = VercelEnvSetup()
    
    # Validate configuration
    if not setup.validate_configuration():
        print("\n❌ Configuration validation failed!")
        return 1
    
    # Create files
    setup.create_env_file("vercel_production.env")
    setup.create_setup_script("setup_vercel_env.sh")
    
    # Print summary
    setup.print_summary()
    
    print("\n🎉 Vercel environment setup complete!")
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)