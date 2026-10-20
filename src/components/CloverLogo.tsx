import { SpidyLogo, type SpidyLogoProps } from './SpidyLogo';

export { SpidyLogo };
export type { SpidyLogoProps };

export const CloverLogo = ({
  size = 28,
  showWordmark = true,
  className = '',
}: {
  size?: number;
  showWordmark?: boolean;
  wordmarkClass?: string;
  className?: string;
}) => (
  <SpidyLogo
    size={size}
    withWordmark={showWordmark}
    className={className}
  />
);

export default SpidyLogo;
