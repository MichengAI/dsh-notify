/** Host 运行时由 DSH 提供的最小编译期声明。 */

declare module '@deepseek-ai/cordis' {
  export interface Context {
    readonly logger: {
      info(message: string): void
      warn(message: string): void
    }
    effect<T>(factory: () => T | Promise<T> | (() => void), label?: string): T
    on(name: string, listener: (...args: any[]) => any): () => void
    get(name: string): unknown
    inject(deps: string[], callback: (ctx: Context) => void): void
  }
}

declare module '@deepseek-ai/schemastery' {
  const z: any
  export default z
}

declare module '@deepseek-ai/dsh-settings' {
  export function settingsNamespace(name: string): symbol
}

declare module '@deepseek-ai/dsh-home-paths' {
  export function resolveDshHome(): string
}

declare module '@deepseek-ai/dsh-client-ui-primitives' {
  import type { ButtonHTMLAttributes, ReactNode } from 'react'
  export const Menu: (props: any) => any
  export const Button: (props: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'outline' | 'solid'
    size?: 'sm' | 'md'
    children?: ReactNode
  }) => ReactNode
}

