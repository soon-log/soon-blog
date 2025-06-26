import remarkGfm from 'remark-gfm';
import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx']
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm]
  }
});

export default withMDX(nextConfig);
