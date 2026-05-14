import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function TopBar() {
  const { t } = useTranslation();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed top-4 left-4 md:top-0 md:left-0 md:right-0 z-50 px-0 md:px-6 py-0 md:py-4"
    >
      <div className="max-w-7xl mx-auto flex justify-start items-start">
        <div className="flex flex-col items-start bg-darkSpace/60 md:bg-transparent rounded-lg md:rounded-none px-2 py-1 md:px-0 md:py-0">
          <motion.h1
            className="text-sm md:text-3xl font-bold text-goldAura tracking-wider leading-tight"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {t('appTitle')}
          </motion.h1>
          <motion.p
            className="text-[10px] md:text-sm text-goldAura/60 tracking-widest"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {t('appSubtitle')}
          </motion.p>
        </div>
      </div>
    </motion.header>
  );
}
