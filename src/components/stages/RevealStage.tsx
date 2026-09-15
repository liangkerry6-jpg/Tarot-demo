import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import type { SelectedCard } from '../../hooks/useGameState';
import type { Intention } from '../../data/contextualSummaries';
import { getSpread, type SpreadId } from '../../config/spreads';
import {
  generateLocalReading,
  type ReadingPosition,
} from '../../utils/readingEngine';

interface RevealStageProps {
  spread: SpreadId;
  selectedCards: SelectedCard[];
  intention: Intention | null;
  onRestart: () => void;
}

const INTENTION_LABELS: Record<Intention, string> = {
  love: 'intentionLove',
  career: 'intentionCareer',
  study: 'intentionStudy',
  social: 'intentionSocial',
  general: 'intentionGeneral',
};

function CardBackSvg({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 50 + Math.cos(angle) * 22;
        const y1 = 50 + Math.sin(angle) * 22;
        const x2 = 50 + Math.cos(angle) * 30;
        const y2 = 50 + Math.sin(angle) * 30;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#D4AF37" strokeWidth="1" opacity="0.4" />
        );
      })}
      <circle cx="50" cy="50" r="18" fill="none" stroke="#D4AF37" strokeWidth="1.2" opacity="0.5" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.3" />
      <path d="M50 38 A12 12 0 1 0 50 62 A9 9 0 1 1 50 38Z" fill="#D4AF37" opacity="0.45" />
      <circle cx="50" cy="50" r="2.5" fill="#D4AF37" opacity="0.6" />
    </svg>
  );
}

function KeywordChips({ keywords }: { keywords: string[] }) {
  if (keywords.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2 md:mt-3">
      {keywords.map((k) => (
        <span
          key={k}
          className="px-2 py-0.5 rounded-full bg-goldAura/10 border border-goldAura/20
                     text-goldAura/70 text-[10px] md:text-xs tracking-wider"
        >
          {k}
        </span>
      ))}
    </div>
  );
}

export function RevealStage({ spread, selectedCards, intention, onRestart }: RevealStageProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [expandedData, setExpandedData] = useState<ReadingPosition | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceLeaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const reading = useMemo(
    () => generateLocalReading(getSpread(spread), selectedCards),
    [spread, selectedCards],
  );

  useEffect(() => {
    setRevealedCards([]);
    selectedCards.forEach((_, index) => {
      setTimeout(() => {
        setRevealedCards(prev => prev.includes(index) ? prev : [...prev, index]);
      }, 400 + index * 700);
    });
  }, [selectedCards]);

  const handleCardEnter = useCallback((pos: ReadingPosition, instant = false) => {
    if (debounceLeaveRef.current) {
      clearTimeout(debounceLeaveRef.current);
      debounceLeaveRef.current = null;
    }
    if (instant) {
      if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
      setExpandedCardId(pos.cardId);
      setExpandedData(pos);
      return;
    }
    if (!hoverTimerRef.current) {
      hoverTimerRef.current = setTimeout(() => {
        setExpandedCardId(pos.cardId);
        setExpandedData(pos);
      }, 500);
    }
  }, []);

  const handleCardLeave = useCallback(() => {
    debounceLeaveRef.current = setTimeout(() => {
      if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
      debounceLeaveRef.current = null;
    }, 300);
  }, []);

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#0b0c10',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = 'arcana_veil_reading.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderCard = (index: number) => {
    const pos = reading.positions[index];
    if (!pos) return null;
    const isRevealed = revealedCards.includes(index);
    const isExpanded = expandedCardId === pos.cardId;

    return (
      <motion.div
        key={pos.cardId}
        layoutId={`card-${pos.cardId}`}
        className="flex flex-col items-center"
        style={{ touchAction: 'manipulation' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.15 }}
        onMouseEnter={() => handleCardEnter(pos)}
        onMouseLeave={handleCardLeave}
        onClick={() => handleCardEnter(pos, true)}
      >
        <span className="text-goldAura/60 text-xs md:text-sm mb-2 md:mb-3 tracking-widest">
          {pos.label}
        </span>

        <motion.div
          layoutId={`card-inner-${pos.cardId}`}
          className="perspective-[1200px]"
          animate={{
            rotateY: isRevealed ? 0 : 180,
            scale: isExpanded ? 1.25 : 1,
            z: isExpanded ? 50 : 0,
          }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="relative w-32 h-44 md:w-40 md:h-56"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Card back */}
            <div
              className="absolute inset-0 rounded-xl border-2 border-goldAura/30
                         bg-gradient-to-br from-[#1a1035] via-[#120c24] to-[#0a0815]
                         flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <CardBackSvg className="w-2/3 h-2/3 opacity-60" />
            </div>

            {/* Card front */}
            <div
              className="absolute inset-0 rounded-xl border-2 border-goldAura/50
                         overflow-hidden shadow-lg shadow-goldAura/10"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <img
                src={pos.imageUrl}
                alt={pos.cardName}
                className={`absolute inset-0 w-full h-full object-cover object-top ${pos.isReversed ? 'rotate-180' : ''}`}
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-2.5 text-center
                              bg-black/30 backdrop-blur-md bg-gradient-to-t from-black/60 to-transparent">
                <h3 className="text-goldAura font-bold tracking-wider text-xs md:text-sm drop-shadow-lg"
                    style={{ fontFamily: "'Cinzel', serif" }}>
                  {pos.cardName}
                </h3>
                <span className={`text-[10px] tracking-wider drop-shadow-lg ${
                  pos.isReversed ? 'text-red-300/80' : 'text-goldAura/70'
                }`}>
                  {pos.isReversed ? t('reversed') : t('upright')}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="relative w-full min-h-screen px-4 py-8 pb-32">
      {/* Title */}
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl md:text-3xl font-bold text-goldAura text-center mb-1 tracking-wider"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        {t('revealTitle')}
      </motion.h2>

      {/* Spread name */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="text-goldAura/60 text-sm md:text-base text-center mb-1 tracking-widest"
        style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif" }}
      >
        {reading.spreadName}
      </motion.p>

      {/* Intention badge */}
      {intention && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-goldAura/50 text-sm text-center mb-6 tracking-wider"
          style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif" }}
        >
          {t(INTENTION_LABELS[intention])}
        </motion.p>
      )}

      {/* Hover hint */}
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="text-goldAura/60 text-sm md:text-base text-center mb-4 tracking-widest"
      >
        点击牌面，洞悉完整牌意...
      </motion.p>

      {/* Exportable area */}
      <div ref={exportRef} className="flex flex-col items-center gap-8 p-6 md:p-8 rounded-2xl bg-darkSpace/50 max-w-5xl mx-auto">
        {/* Cards — layout adapts to spread type */}
        {spread === 'triangle' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 items-start justify-items-center w-full max-w-2xl mx-auto mb-6">
            <div className="col-span-2 md:col-span-1 md:col-start-2">{renderCard(0)}</div>
            <div>{renderCard(1)}</div>
            <div>{renderCard(2)}</div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-4 md:gap-10 mb-6">
            {reading.positions.map((_, index) => renderCard(index))}
          </div>
        )}

        {/* Readings section */}
        <div className="flex flex-col gap-4 w-full">
          {reading.positions.map((pos, index) => {
            const isRevealed = revealedCards.includes(index);
            if (!isRevealed) return null;

            return (
              <motion.div
                key={`reading-${pos.cardId}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.3 }}
                className="p-3 md:p-6 rounded-xl bg-mysticPurple/30 border border-goldAura/20 backdrop-blur-sm"
              >
                <h4 className="text-goldAura font-semibold mb-2 md:mb-3 tracking-wider text-xs md:text-base"
                    style={{ fontFamily: "'Cinzel', serif" }}>
                  <span className="text-goldAura/60">{pos.label}</span>
                  <span className="mx-2 text-goldAura/30">—</span>
                  <span>{pos.cardName}</span>
                  <span className={`ml-2 text-xs ${
                    pos.isReversed ? 'text-red-400/60' : 'text-goldAura/50'
                  }`}>
                    ({pos.isReversed ? t('reversed') : t('upright')})
                  </span>
                </h4>

                {pos.archetype && (
                  <p className="text-goldAura/50 text-[11px] md:text-xs tracking-wider mb-2 px-2">
                    原型 · {pos.archetype}
                  </p>
                )}

                {pos.text && (
                  <p className="text-goldAura/90 text-xs md:text-base leading-relaxed px-2 md:px-3 py-2 rounded-lg
                                bg-goldAura/5 border-l-2 border-goldAura/30">
                    {pos.text}
                  </p>
                )}

                <div className="px-2">
                  <KeywordChips keywords={pos.keywords} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Expanded card overlay */}
      <AnimatePresence>
        {expandedData && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-darkSpace/85 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCardLeave}
          >
            <motion.div
              layoutId={`card-inner-${expandedData.cardId}`}
              className="relative w-full max-w-xs md:max-w-md rounded-xl border-2 border-goldAura/60
                         bg-gradient-to-br from-mysticPurple to-darkSpace
                         overflow-hidden shadow-2xl shadow-goldAura/20"
              onClick={(e) => e.stopPropagation()}
              onMouseLeave={handleCardLeave}
            >
              {/* Image */}
              <div className="relative w-full aspect-[3/4] max-h-[30vh] md:max-h-[30vh] overflow-hidden">
                <img
                  src={expandedData.imageUrl}
                  alt={expandedData.cardName}
                  className={`w-full h-full object-contain ${expandedData.isReversed ? 'rotate-180' : ''}`}
                  crossOrigin="anonymous"
                />
                {/* Orientation badge */}
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs tracking-wider ${
                  expandedData.isReversed
                    ? 'bg-red-900/60 text-red-300 border border-red-500/30'
                    : 'bg-goldAura/20 text-goldAura border border-goldAura/30'
                }`}>
                  {expandedData.isReversed ? t('reversed') : t('upright')}
                </div>
                {/* Close button */}
                <button
                  onClick={() => { setExpandedCardId(null); setExpandedData(null); }}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full
                             bg-darkSpace/70 border border-goldAura/30
                             text-goldAura/70 hover:text-goldAura hover:border-goldAura/60
                             flex items-center justify-center
                             transition-colors duration-200 z-10"
                  aria-label="关闭"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="3" y1="3" x2="11" y2="11" />
                    <line x1="11" y1="3" x2="3" y2="11" />
                  </svg>
                </button>
              </div>

              {/* Scrollable text area */}
              <div className="p-4 md:p-5 max-h-[50vh] md:max-h-[55vh] overflow-y-auto pb-6 md:pb-8">
                <h3 className="text-goldAura text-lg font-bold tracking-wider mb-1 sticky top-0 bg-gradient-to-b from-mysticPurple to-transparent pt-1 -mt-1 pb-2"
                    style={{ fontFamily: "'Cinzel', serif" }}>
                  {expandedData.cardName}
                </h3>

                <p className="text-goldAura/50 text-xs tracking-wider mb-2">
                  <span className="text-goldAura/60">{expandedData.label}</span>
                  <span className="mx-1.5 text-goldAura/30">·</span>
                  {expandedData.archetype && `原型 · ${expandedData.archetype}`}
                </p>

                <KeywordChips keywords={expandedData.keywords} />

                {expandedData.generalText && (
                  <div className="rounded-lg bg-goldAura/5 border border-goldAura/15 p-3 md:p-4 mt-3">
                    <h4 className="text-goldAura/80 text-xs md:text-sm font-semibold tracking-widest mb-1.5"
                        style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif" }}>
                      总述
                    </h4>
                    <p className="text-goldAura/85 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                      {expandedData.generalText}
                    </p>
                  </div>
                )}
                <div className="h-4" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 flex justify-center gap-4 md:gap-6 p-4 md:p-6
                   bg-gradient-to-t from-darkSpace via-darkSpace/90 to-transparent pt-12 z-40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full
                     bg-mysticPurple/50 border-2 border-goldAura/30
                     text-goldAura hover:border-goldAura/60
                     transition-colors duration-300 text-sm md:text-base"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          <RotateCcw className="w-4 h-4" />
          {t('restart')}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full
                     bg-gradient-to-r from-goldAura/20 to-goldAura/10
                     border-2 border-goldAura/50
                     text-goldAura hover:border-goldAura
                     transition-colors duration-300
                     disabled:opacity-50 text-sm md:text-base"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          <Download className="w-4 h-4" />
          {isExporting ? t('exporting') : t('export')}
        </motion.button>
      </motion.div>
    </div>
  );
}
