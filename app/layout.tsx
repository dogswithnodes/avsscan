import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// TODO fonts optimization

import { Fonts } from './_styles/fonts';
import { GlobalStyles } from './_styles/global';
import { Providers } from './_components/providers/providers.component';
import { Shell } from './_components/shell/shell.component';
import StyledComponentsRegistry from './_components/styled-components-registry/styled-components-registry.component';
import { Tooltip } from './_components/tooltip/tooltip.component';
import { GLOBAL_TOOLTIP_ID } from './_constants/tooltip.constants';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Eigen Layer Explorer',
  description: 'Explorer for EigenLayer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <StyledComponentsRegistry>
        <body>
          <Providers>
            <Shell>{children}</Shell>
            <Fonts />
            <GlobalStyles />
            <Tooltip id={GLOBAL_TOOLTIP_ID} clickable delayHide={5} delayShow={500} />
          </Providers>
        </body>
      </StyledComponentsRegistry>
    </html>
  );
}
