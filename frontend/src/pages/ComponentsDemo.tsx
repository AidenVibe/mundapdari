import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  FAB, 
  Chip, 
  Badge, 
  BadgeWrapper, 
  Avatar, 
  AvatarGroup,
  LoadingSpinner 
} from '@/components/ui';
import Navbar from '@/components/layout/Navbar';
import Footer, { BottomNavigation } from '@/components/layout/Footer';
import { colors, familyColors, emotionColors, gradients } from '@/theme/colors';

const ComponentsDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>(['primary']);

  const handleChipClick = (chipId: string) => {
    setSelectedChips(prev => 
      prev.includes(chipId) 
        ? prev.filter(id => id !== chipId)
        : [...prev, chipId]
    );
  };

  // Shared card component
  const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur shadow-sm p-4 sm:p-5 lg:p-6 w-full h-auto ${className}`}>
      {children}
    </div>
  );

  return (
    <>
      {/* Navigation */}
      <Navbar />

      {/* Hero Section with Full Bleed Background */}
      <header className="relative w-full overflow-hidden">
        {/* Background Layer */}
        <div 
          aria-hidden 
          className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-br from-primary-50 via-background-warm to-accent-50"
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Content Container */}
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <p className="text-lg font-medium text-gray-600 opacity-90">
              문답다리 디자인 시스템
            </p>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-gray-800">
              모바일 UX 최적화 컴포넌트
            </h1>
            
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              따뜻한 파스텔 색상과 터치 친화적인 디자인으로 구성된 문답다리 컴포넌트 라이브러리입니다.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <button 
                className="btn-primary min-w-[180px]"
                onClick={() => {
                  document.getElementById('components')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                컴포넌트 보기
              </button>
              <button 
                className="btn border-2 border-gray-300 text-gray-700 hover:bg-gray-50 min-w-[180px]"
                onClick={() => alert('테마 다운로드 기능')}
              >
                테마 다운로드
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative w-full">
        {/* Content Container */}
        <div id="components" className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 space-y-10 sm:space-y-14 lg:space-y-20">
        
          {/* Color Palette */}
          <section>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">색상 팔레트</h2>
            
            <div className="grid gap-6 sm:gap-8 lg:gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {/* Primary Colors */}
              <Card>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Primary (Light Mint)</h3>
                <div className="space-y-3">
                  {Object.entries(colors.primary).map(([shade, color]) => (
                    <div key={shade} className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-8 h-8 flex-shrink-0 rounded-md border shadow-soft"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-medium">{shade}</span>
                          <span className="text-xs text-gray-500 truncate">{color}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Secondary Colors */}
              <Card>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Secondary (Light Coral)</h3>
                <div className="space-y-3">
                  {Object.entries(colors.secondary).map(([shade, color]) => (
                    <div key={shade} className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-8 h-8 flex-shrink-0 rounded-md border shadow-soft"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-medium">{shade}</span>
                          <span className="text-xs text-gray-500 truncate">{color}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Accent Colors */}
              <Card>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Accent (Light Amber)</h3>
                <div className="space-y-3">
                  {Object.entries(colors.accent).map(([shade, color]) => (
                    <div key={shade} className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-8 h-8 flex-shrink-0 rounded-md border shadow-soft"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-medium">{shade}</span>
                          <span className="text-xs text-gray-500 truncate">{color}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Family Colors */}
              <Card>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">가족 관계 색상</h3>
                <div className="space-y-3">
                  {Object.entries(familyColors).map(([relationship, color]) => (
                    <div key={relationship} className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-8 h-8 flex-shrink-0 rounded-md border shadow-soft"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{relationship}</span>
                          <span className="text-xs text-gray-500 truncate">{color}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Emotion Colors */}
              <Card>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">감정 색상</h3>
                <div className="space-y-3">
                  {Object.entries(emotionColors).map(([emotion, color]) => (
                    <div key={emotion} className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-8 h-8 flex-shrink-0 rounded-md border shadow-soft"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{emotion}</span>
                          <span className="text-xs text-gray-500 truncate">{color}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">버튼</h2>
            
            <div className="grid gap-6 sm:gap-8 lg:gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              
              {/* Button Variants */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">버튼 변형</h3>
                <div className="space-y-4">
                  <Button variant="primary" fullWidth>Primary Button</Button>
                  <Button variant="secondary" fullWidth>Secondary Button</Button>
                  <Button variant="accent" fullWidth>Accent Button</Button>
                  <Button variant="success" fullWidth>Success Button</Button>
                  <Button variant="warning" fullWidth>Warning Button</Button>
                  <Button variant="error" fullWidth>Error Button</Button>
                  <Button variant="ghost" fullWidth>Ghost Button</Button>
                  <Button variant="outline" fullWidth>Outline Button</Button>
                </div>
              </Card>

              {/* Button Sizes */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">버튼 크기</h3>
                <div className="space-y-4">
                  <Button size="small" fullWidth>Small Button</Button>
                  <Button size="medium" fullWidth>Medium Button</Button>
                  <Button size="large" fullWidth>Large Button</Button>
                </div>
              </Card>

              {/* Button States */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">버튼 상태</h3>
                <div className="space-y-4">
                  <Button fullWidth>Normal</Button>
                  <Button loading fullWidth>Loading</Button>
                  <Button disabled fullWidth>Disabled</Button>
                </div>
              </Card>
            </div>
          </section>

          {/* Inputs */}
          <section>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">입력 필드</h2>
            
            <div className="grid gap-6 sm:gap-8 lg:gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              <Card>
                <h3 className="text-xl font-semibold mb-4">기본 입력</h3>
                <div className="space-y-4">
                  <Input
                    label="이름"
                    placeholder="이름을 입력해주세요"
                    value={inputValue}
                    onChange={setInputValue}
                  />
                  <Input
                    label="이메일"
                    type="email"
                    placeholder="example@email.com"
                    required
                  />
                  <Input
                    label="비밀번호"
                    type="password"
                    placeholder="비밀번호를 입력해주세요"
                    required
                  />
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">입력 상태</h3>
                <div className="space-y-4">
                  <Input
                    label="성공 상태"
                    placeholder="올바른 입력"
                    value="올바른 값"
                    onChange={() => {}}
                  />
                  <Input
                    label="오류 상태"
                    placeholder="잘못된 입력"
                    error="올바른 형식이 아닙니다"
                  />
                  <Input
                    label="비활성화"
                    placeholder="비활성화된 입력"
                    disabled
                  />
                </div>
              </Card>
            </div>
          </section>

          {/* Chips */}
          <section>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">칩</h2>
            
            <div className="grid gap-6 sm:gap-8 lg:gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              <Card>
                <h3 className="text-xl font-semibold mb-4">칩 변형</h3>
                <div className="flex flex-wrap gap-2">
                  <Chip variant="default">Default</Chip>
                  <Chip variant="primary">Primary</Chip>
                  <Chip variant="secondary">Secondary</Chip>
                  <Chip variant="success">Success</Chip>
                  <Chip variant="warning">Warning</Chip>
                  <Chip variant="error">Error</Chip>
                  <Chip variant="family">Family</Chip>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">선택 가능한 칩</h3>
                <div className="flex flex-wrap gap-2">
                  {['primary', 'secondary', 'success', 'warning'].map((chipId) => (
                    <Chip
                      key={chipId}
                      variant={chipId as any}
                      selected={selectedChips.includes(chipId)}
                      clickable
                      onClick={() => handleChipClick(chipId)}
                    >
                      {chipId.charAt(0).toUpperCase() + chipId.slice(1)}
                    </Chip>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          {/* Avatars and Badges */}
          <section>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">아바타 & 배지</h2>
            
            <div className="grid gap-6 sm:gap-8 lg:gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              <Card>
                <h3 className="text-xl font-semibold mb-4">아바타</h3>
                <div className="space-y-6">
                  {/* 크기별 아바타 */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">크기</h4>
                    <div className="flex items-center space-x-2">
                      <Avatar name="A" size="xs" />
                      <Avatar name="B" size="sm" />
                      <Avatar name="C" size="md" />
                      <Avatar name="D" size="lg" />
                      <Avatar name="E" size="xl" />
                      <Avatar name="F" size="2xl" />
                    </div>
                  </div>

                  {/* 상태별 아바타 */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">상태</h4>
                    <div className="flex items-center space-x-4">
                      <Avatar name="온라인" status="online" />
                      <Avatar name="오프라인" status="offline" />
                      <Avatar name="바쁨" status="busy" />
                      <Avatar name="자리비움" status="away" />
                    </div>
                  </div>

                  {/* 아바타 그룹 */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">아바타 그룹</h4>
                    <AvatarGroup max={3}>
                      <Avatar name="엄마" />
                      <Avatar name="아빠" />
                      <Avatar name="딸" />
                      <Avatar name="아들" />
                      <Avatar name="할머니" />
                    </AvatarGroup>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">배지</h3>
                <div className="space-y-6">
                  {/* 배지 변형 */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">변형</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="primary">1</Badge>
                      <Badge variant="secondary">2</Badge>
                      <Badge variant="success">3</Badge>
                      <Badge variant="warning">4</Badge>
                      <Badge variant="error">5</Badge>
                      <Badge variant="neutral">6</Badge>
                    </div>
                  </div>

                  {/* 배지 래퍼 */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">아이콘과 함께</h4>
                    <div className="flex items-center space-x-4">
                      <BadgeWrapper count={5}>
                        <Button variant="outline">메시지</Button>
                      </BadgeWrapper>
                      
                      <BadgeWrapper count={99} maxCount={9}>
                        <Button variant="outline">알림</Button>
                      </BadgeWrapper>
                      
                      <BadgeWrapper dot>
                        <Avatar name="사용자" />
                      </BadgeWrapper>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">카드</h2>
            
            <div className="grid gap-6 sm:gap-8 lg:gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              <Card>
                <h3 className="text-lg font-semibold mb-2">기본 카드</h3>
                <p className="text-gray-600 mb-4">
                  기본적인 카드 스타일입니다. 그림자와 둥근 모서리가 적용되어 있습니다.
                </p>
                <Button size="small">더 보기</Button>
              </Card>

              <Card className="bg-gradient-warm">
                <h3 className="text-lg font-semibold mb-2">따뜻한 카드</h3>
                <p className="text-gray-600 mb-4">
                  따뜻한 그라데이션이 적용된 카드입니다.
                </p>
                <Button variant="secondary" size="small">더 보기</Button>
              </Card>
            </div>
          </section>

          {/* Loading States */}
          <section>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">로딩 상태</h2>
            
            <Card className="max-w-6xl mx-auto">
              <div className="grid gap-8 text-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Small</h3>
                  <LoadingSpinner size="small" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Medium</h3>
                  <LoadingSpinner size="medium" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Large</h3>
                  <LoadingSpinner size="large" message="로딩 중..." />
                </div>
              </div>
            </Card>
          </section>

          {/* Gradients */}
          <section>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">그라데이션</h2>
            
            <div className="grid gap-6 sm:gap-8 lg:gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {Object.entries(gradients)
                .filter(([name]) => !name.includes('family')) // 보라색 계열 제거
                .map(([name, gradient]) => (
                  <Card key={name} className="text-center">
                    <div 
                      className="w-full h-24 rounded-lg mb-3 shadow-soft"
                      style={{ background: gradient }}
                    />
                    <h3 className="font-semibold capitalize mb-2">{name}</h3>
                    <p className="text-xs text-gray-500 break-all leading-relaxed">{gradient}</p>
                  </Card>
                ))}
            </div>
          </section>
        </div>
      </main>

      {/* FAB */}
      <FAB
        icon={<span className="text-2xl">💬</span>}
        variant="primary"
        onClick={() => alert('FAB 클릭!')}
        aria-label="새 대화 시작"
      />

      {/* Footer */}
      <Footer variant="default" />
      
      {/* Bottom Navigation (Mobile) */}
      <BottomNavigation />
    </>
  );
};

export default ComponentsDemo;