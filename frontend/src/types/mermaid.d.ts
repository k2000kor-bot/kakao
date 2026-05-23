declare module 'mermaid' {
  export interface MermaidConfig {
    startOnLoad?: boolean;
    securityLevel?: string;
    theme?: string;
  }

  interface MermaidAPI {
    initialize: (config: MermaidConfig) => void;
    render: (id: string, text: string) => Promise<{ svg: string }>;
  }

  const mermaid: MermaidAPI;
  export default mermaid;
}
