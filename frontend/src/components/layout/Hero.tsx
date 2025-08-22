import React from 'react';
import { clsx } from 'clsx';
import Button from '../ui/Button';

interface HeroProps {
  variant?: 'default' | 'centered' | 'split' | 'minimal';
  title?: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    text: string;
    onClick: () => void;
    href?: string;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
    href?: string;
  };
  image?: string;
  imageAlt?: string;
  background?: 'default' | 'gradient' | 'warm' | 'cool';
  className?: string;
  children?: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({
  variant = 'default',
  title = '가족과 더 가까워지는 시간',
  subtitle = '문답다리',
  description = '매일 하나의 질문으로 가족 간의 소통을 늘려보세요. 간단한 대화가 특별한 추억이 됩니다.',
  primaryAction,
  secondaryAction,
  image,
  imageAlt,
  background = 'gradient',
  className,
  children,
}) => {
  const baseClasses = 'relative overflow-hidden';
  
  const backgroundClasses = {
    default: 'bg-background-primary',
    gradient: 'bg-gradient-primary',
    warm: 'bg-gradient-warm',
    cool: 'bg-gradient-cool',
  };

  const textColorClasses = {
    default: 'text-gray-800',
    gradient: 'text-white',
    warm: 'text-gray-800',
    cool: 'text-gray-800',
  };

  const renderContent = () => {
    switch (variant) {
      case 'centered':
        return (
          <div className="text-center max-w-4xl mx-auto">
            {subtitle && (
              <p className={clsx(
                'text-lg font-medium mb-4 opacity-90',
                textColorClasses[background]
              )}>
                {subtitle}
              </p>
            )}
            
            <h1 className={clsx(
              'text-4xl md:text-6xl font-bold mb-6 leading-tight',
              textColorClasses[background]
            )}>
              {title}
            </h1>
            
            {description && (
              <p className={clsx(
                'text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto',
                textColorClasses[background]
              )}>
                {description}
              </p>
            )}
            
            {(primaryAction || secondaryAction) && (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {primaryAction && (
                  <Button
                    variant="primary"
                    size="large"
                    onClick={primaryAction.onClick}
                    className="min-w-[180px]"
                  >
                    {primaryAction.text}
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    variant="outline"
                    size="large"
                    onClick={secondaryAction.onClick}
                    className="min-w-[180px]"
                  >
                    {secondaryAction.text}
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      case 'split':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 왼쪽: 텍스트 콘텐츠 */}
            <div>
              {subtitle && (
                <p className={clsx(
                  'text-lg font-medium mb-4 opacity-90',
                  textColorClasses[background]
                )}>
                  {subtitle}
                </p>
              )}
              
              <h1 className={clsx(
                'text-4xl md:text-5xl font-bold mb-6 leading-tight',
                textColorClasses[background]
              )}>
                {title}
              </h1>
              
              {description && (
                <p className={clsx(
                  'text-lg mb-8 opacity-90',
                  textColorClasses[background]
                )}>
                  {description}
                </p>
              )}
              
              {(primaryAction || secondaryAction) && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {primaryAction && (
                    <Button
                      variant="primary"
                      size="large"
                      onClick={primaryAction.onClick}
                    >
                      {primaryAction.text}
                    </Button>
                  )}
                  {secondaryAction && (
                    <Button
                      variant="outline"
                      size="large"
                      onClick={secondaryAction.onClick}
                    >
                      {secondaryAction.text}
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* 오른쪽: 이미지 또는 일러스트 */}
            <div className="relative">
              {image ? (
                <img
                  src={image}
                  alt={imageAlt || '문답다리 서비스 이미지'}
                  className="w-full h-auto rounded-2xl shadow-soft-xl"
                />
              ) : (
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-12 text-center">
                  <div className="text-8xl mb-4">💬</div>
                  <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
                  <p className={clsx(
                    'text-lg opacity-80',
                    textColorClasses[background]
                  )}>
                    가족 간 소통의 다리
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="text-center max-w-2xl mx-auto">
            <h1 className={clsx(
              'text-3xl md:text-4xl font-bold mb-4',
              textColorClasses[background]
            )}>
              {title}
            </h1>
            
            {description && (
              <p className={clsx(
                'text-lg mb-6 opacity-90',
                textColorClasses[background]
              )}>
                {description}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center">
            {subtitle && (
              <p className={clsx(
                'text-lg font-medium mb-4 opacity-90',
                textColorClasses[background]
              )}>
                {subtitle}
              </p>
            )}
            
            <h1 className={clsx(
              'text-4xl md:text-6xl font-bold mb-6 leading-tight',
              textColorClasses[background]
            )}>
              {title}
            </h1>
            
            {description && (
              <p className={clsx(
                'text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto',
                textColorClasses[background]
              )}>
                {description}
              </p>
            )}
            
            {(primaryAction || secondaryAction) && (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {primaryAction && (
                  <Button
                    variant="primary"
                    size="large"
                    onClick={primaryAction.onClick}
                    className="min-w-[180px]"
                  >
                    {primaryAction.text}
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    variant="outline"
                    size="large"
                    onClick={secondaryAction.onClick}
                    className="min-w-[180px]"
                  >
                    {secondaryAction.text}
                  </Button>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <section className={clsx(
      baseClasses,
      backgroundClasses[background],
      className
    )}>
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        {children || renderContent()}
      </div>
    </section>
  );
};

// 특화된 Hero 변형들
export const WelcomeHero: React.FC<{ onGetStarted: () => void; onLearnMore: () => void }> = ({
  onGetStarted,
  onLearnMore,
}) => (
  <Hero
    variant="split"
    background="gradient"
    subtitle="문답다리"
    title="가족과 더 가까워지는 시간"
    description="매일 하나의 질문으로 가족 간의 소통을 늘려보세요. 간단한 대화가 특별한 추억이 됩니다."
    primaryAction={{
      text: "지금 시작하기",
      onClick: onGetStarted,
    }}
    secondaryAction={{
      text: "더 알아보기",
      onClick: onLearnMore,
    }}
  />
);

export const LoginHero: React.FC = () => (
  <Hero
    variant="minimal"
    background="gradient"
    title="다시 만나서 반가워요"
    description="가족과의 소중한 대화를 이어가세요"
  />
);

export const ErrorHero: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <Hero
    variant="centered"
    background="warm"
    title="앗, 문제가 발생했어요"
    description="잠시 후 다시 시도해주세요. 계속 문제가 발생하면 고객센터로 문의해주세요."
    primaryAction={{
      text: "다시 시도",
      onClick: onRetry,
    }}
    secondaryAction={{
      text: "홈으로 가기",
      onClick: () => window.location.href = '/',
    }}
  />
);

export default Hero;