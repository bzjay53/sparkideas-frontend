'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LinearCard, LinearButton } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ArrowLeftIcon, ShareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function PRDViewerPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold">PRD 상세보기</h1>
              </div>
              <div className="flex items-center space-x-2">
                <LinearButton 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 font-medium"
                >
                  <ShareIcon className="w-4 h-4 mr-1" />
                  <span className="text-gray-700">공유</span>
                </LinearButton>
                <LinearButton 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 font-medium"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                  <span className="text-gray-700">다운로드</span>
                </LinearButton>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <LinearCard padding="lg">
            {/* Document Header */}
            <div className="border-b border-gray-200 pb-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Product Requirements Document
                  </h1>
                  <div className="text-sm text-gray-600">
                    <span>PRD ID: {params.id}</span>
                    <span className="mx-2">•</span>
                    <span>Version: 1.0</span>
                    <span className="mx-2">•</span>
                    <span>Last Updated: 2024-08-19</span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Approved
                </div>
              </div>
            </div>

            {/* Project Overview */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">1. Project Overview</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Summary</h3>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <p className="text-gray-800">
                      An AI-powered collaboration platform designed to streamline remote development workflows, 
                      automate code reviews, and enhance team productivity through intelligent project management.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Key Objectives</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">Reduce code review time by 60%</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">Improve project delivery predictability</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">Enhance developer experience and satisfaction</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* User Stories & Requirements */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">2. User Stories & Functional Requirements</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Epic 1: Intelligent Code Review System</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="font-medium text-gray-900 mb-2">User Story 1.1</p>
                      <p className="text-gray-700 mb-2">
                        As a <strong>developer</strong>, I want to receive automated code quality feedback 
                        so that I can identify issues before manual review.
                      </p>
                      <div className="flex space-x-4 text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Priority: High</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Story Points: 8</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="font-medium text-gray-900 mb-2">User Story 1.2</p>
                      <p className="text-gray-700 mb-2">
                        As a <strong>team lead</strong>, I want to configure code review rules and standards 
                        so that all team members follow consistent practices.
                      </p>
                      <div className="flex space-x-4 text-sm">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Priority: Medium</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Story Points: 5</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Epic 2: Project Analytics & Insights</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="font-medium text-gray-900 mb-2">User Story 2.1</p>
                      <p className="text-gray-700 mb-2">
                        As a <strong>project manager</strong>, I want to view real-time project metrics 
                        so that I can make data-driven decisions about resource allocation.
                      </p>
                      <div className="flex space-x-4 text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Priority: High</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Story Points: 13</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Architecture */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. Technical Architecture</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Architecture Diagram</h3>
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="grid grid-cols-3 gap-8 mb-6">
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <div className="text-blue-600 font-semibold mb-2">Frontend Layer</div>
                      <div className="text-sm text-gray-700">
                        React + TypeScript<br/>
                        Tailwind CSS<br/>
                        Zustand State Management
                      </div>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg">
                      <div className="text-green-600 font-semibold mb-2">API Gateway</div>
                      <div className="text-sm text-gray-700">
                        Next.js API Routes<br/>
                        Authentication<br/>
                        Rate Limiting
                      </div>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg">
                      <div className="text-purple-600 font-semibold mb-2">AI Services</div>
                      <div className="text-sm text-gray-700">
                        OpenAI GPT-4<br/>
                        Code Analysis<br/>
                        Natural Language Processing
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-6">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="bg-orange-100 p-4 rounded-lg">
                        <div className="text-orange-600 font-semibold mb-2">Database Layer</div>
                        <div className="text-sm text-gray-700">
                          PostgreSQL (Primary)<br/>
                          Redis (Cache)<br/>
                          Supabase (Real-time)
                        </div>
                      </div>
                      <div className="bg-gray-200 p-4 rounded-lg">
                        <div className="text-gray-600 font-semibold mb-2">External APIs</div>
                        <div className="text-sm text-gray-700">
                          GitHub/GitLab Integration<br/>
                          Slack/Discord Webhooks<br/>
                          JIRA/Linear Sync
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Implementation Plan */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">4. Implementation Plan</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Phase 1: Core Infrastructure (Weeks 1-4)</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <input type="checkbox" checked disabled className="mr-3" />
                        <span className="text-gray-700">Set up development environment and CI/CD pipeline</span>
                      </li>
                      <li className="flex items-center">
                        <input type="checkbox" checked disabled className="mr-3" />
                        <span className="text-gray-700">Implement user authentication and authorization</span>
                      </li>
                      <li className="flex items-center">
                        <input type="checkbox" disabled className="mr-3" />
                        <span className="text-gray-700">Create basic project dashboard and navigation</span>
                      </li>
                      <li className="flex items-center">
                        <input type="checkbox" disabled className="mr-3" />
                        <span className="text-gray-700">Establish database schema and data models</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Phase 2: AI Integration (Weeks 5-8)</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <input type="checkbox" disabled className="mr-3" />
                        <span className="text-gray-700">Integrate OpenAI API for code analysis</span>
                      </li>
                      <li className="flex items-center">
                        <input type="checkbox" disabled className="mr-3" />
                        <span className="text-gray-700">Develop automated code review algorithms</span>
                      </li>
                      <li className="flex items-center">
                        <input type="checkbox" disabled className="mr-3" />
                        <span className="text-gray-700">Create intelligent project insights engine</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Phase 3: Advanced Features (Weeks 9-12)</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <input type="checkbox" disabled className="mr-3" />
                        <span className="text-gray-700">Implement real-time collaboration features</span>
                      </li>
                      <li className="flex items-center">
                        <input type="checkbox" disabled className="mr-3" />
                        <span className="text-gray-700">Add third-party integrations (GitHub, Slack, etc.)</span>
                      </li>
                      <li className="flex items-center">
                        <input type="checkbox" disabled className="mr-3" />
                        <span className="text-gray-700">Build comprehensive analytics dashboard</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Success Metrics */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">5. Success Metrics & KPIs</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">60%</div>
                  <div className="text-sm text-gray-700 mb-1">Reduction in</div>
                  <div className="font-medium text-gray-900">Code Review Time</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
                  <div className="text-sm text-gray-700 mb-1">Improvement in</div>
                  <div className="font-medium text-gray-900">Delivery Predictability</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                  <div className="text-sm text-gray-700 mb-1">Target</div>
                  <div className="font-medium text-gray-900">Developer Satisfaction</div>
                </div>
              </div>
            </section>

            {/* Risk Assessment */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">6. Risk Assessment</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-red-400 bg-red-50 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-red-900">High: AI Model Accuracy</h3>
                    <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs">High Impact</span>
                  </div>
                  <p className="text-red-800 text-sm mb-2">
                    AI-generated code suggestions may not always be accurate or contextually appropriate.
                  </p>
                  <p className="text-red-700 text-sm">
                    <strong>Mitigation:</strong> Implement human review checkpoints and confidence scoring for AI suggestions.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-yellow-900">Medium: Integration Complexity</h3>
                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">Medium Impact</span>
                  </div>
                  <p className="text-yellow-800 text-sm mb-2">
                    Third-party integrations may be more complex than anticipated, affecting timeline.
                  </p>
                  <p className="text-yellow-700 text-sm">
                    <strong>Mitigation:</strong> Start integration work early in Phase 2 and have fallback options ready.
                  </p>
                </div>
              </div>
            </section>

            {/* Approval Section */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">7. Approval & Sign-off</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900">Product Manager</div>
                  <div className="text-sm text-gray-600">Approved on 2024-08-19</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900">Engineering Lead</div>
                  <div className="text-sm text-gray-600">Approved on 2024-08-19</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-900">Design Lead</div>
                  <div className="text-sm text-gray-600">Pending Review</div>
                </div>
              </div>
            </section>
          </LinearCard>
        </div>
      </div>
    </ProtectedRoute>
  );
}