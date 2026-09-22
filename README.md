# site-customizer

一个 Codex 技能：**把现有的网站、模板或仓库变成"可自定义"的版本**——文字、图片、动效开关都能直接在页面上编辑，改完一键导出干净的成品文件。

它把一套实际做过的流程固化下来：配置驱动的内容层、内置可视化编辑器、双击页面任意位置跳到对应设置、导出时用精简模板而不是复制编辑器（导出体积差 4～5 倍），以及那条最容易踩的坑——**编辑列表里的嵌套字段时，数组不能被当成对象合并**。

## 安装

```bash
git clone https://github.com/aspire-23/site-customizer-skill.git

# macOS / Linux
cp -r site-customizer-skill/skills/site-customizer ~/.codex/skills/
```

```powershell
# Windows PowerShell
git clone https://github.com/aspire-23/site-customizer-skill.git
Copy-Item -Recurse .\site-customizer-skill\skills\site-customizer $env:USERPROFILE\.codex\skills\
```

装好后新开一个对话，说「把这个网站做成可自定义的」或直接 `$site-customizer` 就会触发。

## 里面有什么

```
skills/site-customizer/
├─ SKILL.md                 主流程：定输出形态与编辑权限 → 盘点内容 → 抽配置 → 做编辑器 → 导出 → 验证
├─ references/
│  ├─ patterns.md           可直接复用的实现：配置合并（数组安全）、编辑器外壳、双击跳转、导出注入、多构建模式、可拖拽组件
│  └─ pitfalls.md           实际踩过的坑与验证方法：file:// 白屏、列表变对象整站崩、草稿串台、导出变胖、平台坑
├─ scripts/
│  └─ embed-template.mjs    把成品内嵌成"精简模板"，让导出文件从 6 MB 降到 1.3 MB
└─ assets/vite-single-file/ 单文件站点构建骨架（Vite 配置 + classic-script 构建后处理）
```

## 适用范围

骨架是 Vite + React（最初实现时用的栈），但 `references/` 里的方法和坑与框架无关；换成 Vue、Next.js 或纯 HTML 站点同样适用，只需要替换构建脚本部分。

不适用于对已完成网站做普通的内容修改——那种直接改就行，不需要这个技能。
