// 牌阵配置：单张 / 时间之流 / 三角阵
export type SpreadId = 'single' | 'timeFlow' | 'triangle';

// 与 tarotCards.json 中 upright/reversed 的 7 个解读槽位一一对应
export type ReadingSlot =
  | 'general'
  | 'surface'
  | 'subconscious'
  | 'advice'
  | 'past'
  | 'present'
  | 'future';

export interface SpreadPosition {
  key: string;
  label: string;
  slot: ReadingSlot;
}

export interface SpreadDefinition {
  id: SpreadId;
  nameCn: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
}

export const SPREADS: SpreadDefinition[] = [
  {
    id: 'single',
    nameCn: '单张指引',
    description: '抽取一张牌，获得此刻最核心的指引。',
    cardCount: 1,
    positions: [{ key: 'core', label: '核心指引', slot: 'general' }],
  },
  {
    id: 'timeFlow',
    nameCn: '时间之流',
    description: '三张牌对应过去、现在与未来，洞察因果脉络。',
    cardCount: 3,
    positions: [
      { key: 'past', label: '过去', slot: 'past' },
      { key: 'present', label: '现在', slot: 'present' },
      { key: 'future', label: '未来', slot: 'future' },
    ],
  },
  {
    id: 'triangle',
    nameCn: '三角阵',
    description: '三张牌构成三角，分别映照表象、潜意识与行动建议。',
    cardCount: 3,
    positions: [
      { key: 'surface', label: '表象', slot: 'surface' },
      { key: 'subconscious', label: '潜意识', slot: 'subconscious' },
      { key: 'advice', label: '建议', slot: 'advice' },
    ],
  },
];

export const getSpread = (id: SpreadId): SpreadDefinition =>
  SPREADS.find((s) => s.id === id) ?? SPREADS[0];
