import React from 'react';

export interface LinearFooterProps {
  className?: string;
}

export const LinearFooter: React.FC<LinearFooterProps> = ({
  className = '',
}) => {
  return (
    <footer className={`bg-gray-900 text-white py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">IdeaSpark</h3>
            <p className="text-gray-400 mb-4 max-w-md">
              AI로 발굴하는 실시간 비즈니스 기회. 세상의 갈증포인트를 분석하여 검증된 아이디어를 자동 생성합니다.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">서비스</h4>
            <ul className="space-y-2">
              <li>
                <a href="/pain-points" className="text-gray-400 hover:text-white transition-colors">
                  갈증포인트
                </a>
              </li>
              <li>
                <a href="/business-ideas" className="text-gray-400 hover:text-white transition-colors">
                  비즈니스 아이디어
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  대시보드
                </a>
              </li>
              <li>
                <a href="/prd-viewer" className="text-gray-400 hover:text-white transition-colors">
                  PRD 뷰어
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">문의</h4>
            <ul className="space-y-2">
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/support" className="text-gray-400 hover:text-white transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} IdeaSpark. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LinearFooter;