import type { SpreadDefinition, ReadingSlot } from '../config/spreads';
import type { SelectedCard } from '../hooks/useGameState';
import rawCards from '../data/tarotCards.json';

// 与 tarotCards.json 对应的卡牌类型
export interface TarotCardV2 {
  id: number;
  nameCn: string;
  archetype: string;
  keywords: string[];
  upright: Record<ReadingSlot, string>;
  reversed: Record<ReadingSlot, string>;
}

const v2Cards = rawCards as TarotCardV2[];

export const SLOT_LABELS: Record<ReadingSlot, string> = {
  general: '总述',
  surface: '表象',
  subconscious: '潜意识',
  advice: '建议',
  past: '过去',
  present: '现在',
  future: '未来',
};

// 单个牌阵位置的解读结果
export interface ReadingPosition {
  label: string;
  cardId: number;
  cardName: string;
  archetype: string;
  keywords: string[];
  imageUrl: string;
  isReversed: boolean;
  text: string;
}

export interface LocalReading {
  spreadId: string;
  spreadName: string;
  positions: ReadingPosition[];
}

// 一张牌的完整 7 槽位解读（用于点开牌面后查看）
export interface CardInterpretation {
  cardId: number;
  nameCn: string;
  archetype: string;
  keywords: string[];
  slots: Record<ReadingSlot, string>;
}

const findCard = (cardId: number): TarotCardV2 | undefined =>
  v2Cards.find((c) => c.id === cardId);

export function getCardInterpretation(cardId: number, isReversed: boolean): CardInterpretation {
  const card = findCard(cardId);
  const slots = isReversed ? card?.reversed : card?.upright;
  return {
    cardId,
    nameCn: card?.nameCn ?? '',
    archetype: card?.archetype ?? '',
    keywords: card?.keywords ?? [],
    slots: slots ?? ({} as Record<ReadingSlot, string>),
  };
}

// 根据牌阵与所选卡牌生成本地解读（静态引擎，无网络请求）
export function generateLocalReading(
  spread: SpreadDefinition,
  cards: SelectedCard[],
): LocalReading {
  const positions = spread.positions.map((pos, i) => {
    const selected = cards[i];
    const card = selected ? findCard(selected.card.id) : undefined;
    const orientation = selected?.isReversed ? card?.reversed : card?.upright;

    return {
      label: pos.label,
      cardId: selected?.card.id ?? -1,
      cardName: card?.nameCn ?? selected?.card.name_cn ?? '',
      archetype: card?.archetype ?? '',
      keywords: card?.keywords ?? [],
      imageUrl: selected?.card.image_url ?? '',
      isReversed: selected?.isReversed ?? false,
      text: orientation?.[pos.slot] ?? '',
    };
  });

  return {
    spreadId: spread.id,
    spreadName: spread.nameCn,
    positions,
  };
}
