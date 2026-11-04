import 'vue-router';

// 为文档站路由 meta 补充业务字段类型（router 中统一写入），使模板/脚本可类型安全读取。
declare module 'vue-router' {
  interface RouteMeta {
    id?: string;
    label?: string;
    tag?: string;
    migrated?: boolean;
  }
}

export {};
