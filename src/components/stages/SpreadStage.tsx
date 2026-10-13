import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Circle, Clock, Triangle } from 'lucide-react';
import { SPREADS, type SpreadId } from '../../config/spreads';

interface SpreadStageProps {
  onSelectSpread: (spread: SpreadId) => void;
}

const spreadIcons: Record<SpreadId, typeof Circle> = {
  single: Circle,
  timeFlow: Clock,
  triangle: Triangle,
};

export function SpreadStage({ onSelectSpread }: SpreadStageProps) {
  const { t } = useTranslation();

  const handleClick = useCallback(
    (id: SpreadId) => {
      onSelectSpread(id);
    },
    [onSelectSpread],
  );

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-xl md:text-3xl font-bold text-goldAura text-center mb-2 md:mb-3 tracking-wider px-2"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        {t('spreadTitle')}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-goldAura/50 text-xs md:text-sm text-center mb-6 md:mb-10 tracking-wider"
        style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif" }}
      >
        {t('spreadSubtitle')}
      </motion.p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {SPREADS.map((spread, i) => {
          const Icon = spreadIcons[spread.id];

          return (
            <motion.button
              key={spread.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03, x: 6 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleClick(spread.id)}
              className="relative flex items-center gap-4 px-6 py-4 rounded-xl
                         bg-white/5 backdrop-blur-md border border-white/10
                         hover:bg-white/10 hover:border-goldAura/40
                         text-goldAura/80 hover:text-goldAura
                         transition-all duration-300 group overflow-hidden"
            >
              <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full
                              flex items-center justify-center
                              bg-goldAura/10 group-hover:bg-goldAura/20 transition-colors">
                <Icon className="w-5 h-5 text-goldAura/70 group-hover:text-goldAura transition-colors" />
              </div>
              <div className="relative z-10 flex flex-col items-start text-left">
                <span className="text-base md:text-lg tracking-wider"
                      style={{ fontFamily: "'Cinzel', 'Noto Serif SC', serif" }}>
                  {spread.nameCn}
                </span>
                <span className="text-[11px] md:text-xs text-goldAura/50 tracking-wider mt-0.5">
                  {spread.description}
                </span>
              </div>
              <span className="ml-auto text-goldAura/20 group-hover:text-goldAura/50 transition-colors text-lg">
                →
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
