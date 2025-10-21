---
cssclass: home-page
---
# 🏠 欢迎回来

> [!quote] 💭 每日一言 知识的积累，始于每一次的记录与思考。
---

## 📊 知识库概览

```dataviewjs
const pages = dv.pages('""').where(p => !p.file.path.includes("Templates"))
const grouped = pages.groupBy(p => {
    if (p.file.path.includes("00-Inbox")) return "📘 Inbox"
    if (p.file.path.includes("01-Notes")) return "📗 Notes"
    if (p.file.path.includes("02-Projects")) return "📙 Projects"
    if (p.file.path.includes("03-Resources")) return "📒 Resources"
    return "🗂 Others"
})

dv.table(["分类", "数量"], 
    grouped.map(g => [g.key, g.rows.length])
           .sort((a, b) => b[1] - a[1])
)
```

---

## 📥 收集箱

```dataview
TABLE WITHOUT ID
  file.link as "文件",
  dateformat(file.ctime, "MM-dd HH:mm") as "创建时间",
  file.size as "大小"
FROM "00-Inbox"
WHERE file.name != "收集箱说明"
SORT file.ctime DESC
LIMIT 8
```

---

## 📌 学习任务

```dataviewjs
const pages = dv.pages('"01-Notes"').where(p => p.study_status)
const tableData = pages.map(p => {
    const pathParts = p.file.path.split('/')
    const module = pathParts[pathParts.length - 2] || "根目录"
    return [
        p.file.link,
        module,
        p.study_status,
        dv.date(p.file.mtime).toFormat("MM-dd")
    ]
}).sort((a, b) => dv.date(b[3]) - dv.date(a[3])).slice(0, 10)

dv.table(["笔记", "模块", "学习状态", "更新"], tableData)
```

> [!info] 💡 提示 在笔记文件的 YAML 中添加 `study_status` 字段来跟踪学习进度

---

## 📊 项目进展

```dataview
TABLE WITHOUT ID
  file.link as "项目",
  status as "状态",
  progress as "进度",
  dateformat(file.mtime, "MM-dd") as "更新"
FROM "02-Projects"
WHERE status
SORT file.mtime DESC
LIMIT 5
```

> [!tip] 💡 提示 在项目文件的 YAML 中添加 `status` 和 `progress` 字段可以在这里显示

---

## 🔥 最近更新

```dataview
TABLE WITHOUT ID
  file.link as "文件",
  dateformat(file.mtime, "yyyy-MM-dd HH:mm") as "修改时间"
FROM "" AND -"Templates"
WHERE file.name != "首页" AND file.name != "Dashboard" AND file.name != "Home"
SORT file.mtime DESC
LIMIT 10
```

## 🏷️ 热门标签

```dataview
TABLE WITHOUT ID
  rows.file.etags[0] as "标签",
  length(rows) as "使用次数"
FROM "" AND -"Templates"
WHERE file.tags
FLATTEN file.tags as tag
GROUP BY tag
SORT length(rows) DESC
LIMIT 12
```

---
