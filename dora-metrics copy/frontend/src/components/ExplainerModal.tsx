import React from 'react';
import { X, BarChart3, TrendingDown, Clock, AlertTriangle } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ExplainerModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * ExplainerModal Component
 * 
 * Modal that explains the DORA metrics and their significance.
 * Provides educational content about each metric and performance benchmarks.
 */
export const ExplainerModal: React.FC<ExplainerModalProps> = ({
  open,
  onClose,
}) => {
  if (!open) return null;

  const metrics = [
    {
      name: 'Deployment Frequency',
      icon: BarChart3,
      color: '#10b981',
      description: 'How often your organization successfully releases to production.',
      benchmarks: [
        { level: 'Elite', range: 'Multiple deployments per day', color: '#10b981' },
        { level: 'High', range: 'Between once per week and once per month', color: '#f59e0b' },
        { level: 'Medium', range: 'Between once per month and once every 6 months', color: '#ef4444' },
        { level: 'Low', range: 'Fewer than once per 6 months', color: '#6b7280' },
      ],
      insights: [
        'Higher deployment frequency typically correlates with better outcomes',
        'Frequent deployments reduce risk by making changes smaller',
        'Teams with high deployment frequency recover from failures faster',
      ],
    },
    {
      name: 'Lead Time for Changes',
      icon: Clock,
      color: '#3b82f6',
      description: 'How long it takes to go from code committed to code successfully running in production.',
      benchmarks: [
        { level: 'Elite', range: 'Less than one day', color: '#10b981' },
        { level: 'High', range: 'Between one day and one week', color: '#f59e0b' },
        { level: 'Medium', range: 'Between one week and one month', color: '#ef4444' },
        { level: 'Low', range: 'Between one month and six months', color: '#6b7280' },
      ],
      insights: [
        'Short lead times enable faster feedback and course correction',
        'Reduced lead time often results from automation and streamlined processes',
        'Elite performers have significantly shorter lead times',
      ],
    },
    {
      name: 'Change Failure Rate',
      icon: TrendingDown,
      color: '#F43F5E',
      description: 'The percentage of deployments causing a failure in production that requires immediate remedy.',
      benchmarks: [
        { level: 'Elite', range: '0-15%', color: '#10b981' },
        { level: 'High', range: '16-30%', color: '#f59e0b' },
        { level: 'Medium', range: '31-45%', color: '#ef4444' },
        { level: 'Low', range: '46-60%', color: '#6b7280' },
      ],
      insights: [
        'Lower change failure rates indicate more stable deployments',
        'Good testing and deployment practices reduce failure rates',
        'Elite teams balance speed with stability',
      ],
    },
    {
      name: 'Mean Time to Restore',
      icon: AlertTriangle,
      color: '#F43F5E',
      description: 'How long it takes to recover from a failure in production.',
      benchmarks: [
        { level: 'Elite', range: 'Less than one hour', color: '#10b981' },
        { level: 'High', range: 'Less than one day', color: '#f59e0b' },
        { level: 'Medium', range: 'Between one day and one week', color: '#ef4444' },
        { level: 'Low', range: 'Between one week and one month', color: '#6b7280' },
      ],
      insights: [
        'Fast recovery times minimize the impact of failures',
        'Good monitoring and incident response practices improve MTTR',
        'Elite teams can recover from incidents very quickly',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">DORA Metrics Explained</h2>
            <p className="text-gray-400 mt-1">
              Understanding the four key metrics that measure DevOps performance
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Introduction */}
          <div className="mb-8">
            <p className="text-gray-300 leading-relaxed">
              DORA (DevOps Research and Assessment) metrics are based on six years of research by the 
              DevOps Research and Assessment team. These four key metrics provide a scientific approach 
              to measuring DevOps performance and identifying areas for improvement.
            </p>
          </div>

          {/* Metrics */}
          <div className="space-y-8">
            {metrics.map((metric) => (
              <Card key={metric.name} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${metric.color}20` }}
                    >
                      <metric.icon 
                        className="h-6 w-6"
                        style={{ color: metric.color }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 
                        className="text-xl font-semibold mb-2"
                        style={{ color: metric.color }}
                      >
                        {metric.name}
                      </h3>
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {metric.description}
                      </p>

                      {/* Benchmarks */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                          Performance Benchmarks
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {metric.benchmarks.map((benchmark) => (
                            <div 
                              key={benchmark.level}
                              className="flex items-center gap-3 p-3 bg-gray-750 rounded-lg"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: benchmark.color }}
                              />
                              <div>
                                <div 
                                  className="font-medium text-sm"
                                  style={{ color: benchmark.color }}
                                >
                                  {benchmark.level}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {benchmark.range}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Insights */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                          Key Insights
                        </h4>
                        <ul className="space-y-1">
                          {metric.insights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-2 flex-shrink-0" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Information */}
          <Card className="bg-blue-900/20 border-blue-700/50 mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">
                Research Background
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                These metrics are based on rigorous research conducted by Dr. Nicole Forsgren, 
                Jez Humble, and Gene Kim, published in the book "Accelerate: The Science of 
                Lean Software and DevOps." The research surveyed thousands of professionals 
                worldwide and identified these four metrics as the most predictive indicators 
                of software delivery performance.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Organizations that excel in these metrics are more likely to achieve their 
                commercial and non-commercial goals, including profitability, productivity, 
                and customer satisfaction.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800/50">
          <Button
            onClick={onClose}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Got it, thanks!
          </Button>
        </div>
      </div>
    </div>
  );
};