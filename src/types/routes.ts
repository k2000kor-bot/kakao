export interface RouteConfig {
    path: string;
    name: string;
    component: React.ComponentType<Record<string, unknown>>;
    description?: string;
    icon?: string;
    category?: string;
    isActive?: boolean;
}

export interface RouteCategory {
    id: string;
    name: string;
    description?: string;
    routes: RouteConfig[];
}

export interface NavigationConfig {
    categories: RouteCategory[];
    defaultRoute: string;
} 