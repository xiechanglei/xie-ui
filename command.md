# command 跨层命令

面向使用者：不用手写事件监听和接线，声明一个属性即可让按钮驱动外层组件。

## 协议如何工作与使用

在触发件上写 `command="命令名"`，点击时它会派发一个 `x-command` 事件沿祖先链向上冒泡（跨 shadow），由**第一个认领它的祖先组件**接走并执行对应动作。

```html
<x-dialog>
  <x-form>
    <!-- 字段... -->
    <x-form-footer>
      <!-- submit 被最近的 x-form 认领；close 越过 form 继续上传，被 x-dialog 认领 -->
      <x-button command="submit">提交</x-button>
      <x-button command="close">取消</x-button>
    </x-form-footer>
  </x-form>
</x-dialog>
```

两条使用规则：

1. **触发件必须放在目标组件内部**（命令只沿祖先链上传，写成兄弟节点就够不着）。
2. 就近优先：嵌套时命令交给最里面认领它的那个组件；链上无人认领时 `submit`/`reset` 会退回页面原生 `<form>`，再没有则什么都不发生。

## 可以产生 command 的元素

| 元素 | 用法 |
| --- | --- |
| `<x-button command="…">` | 点击时向上递交指定的命令 |

## 可以接收 command 的元素

| 元素 | 认领的命令 | 效果 |
| --- | --- | --- |
| `<x-form>` | `submit` / `reset` | 提交（含校验，派发可取消的 `x-submit`）/ 还原为初始值 |
| `<x-dialog>` | `close` | 关闭对话框（派发可取消的 `x-close`；`closable=false` 时依然可用） |
| `<x-drawer>` | `close` | 关闭抽屉（同上） |
