import { DarkTheme, type Theme } from '@react-navigation/native';
import { colors } from './tokens';

/** 与界面 tokens 对齐，避免导航默认浅色 card 与底部栏叠色 */
export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.bg,
    text: colors.textMain,
    border: colors.border,
    notification: colors.danger,
  },
};
