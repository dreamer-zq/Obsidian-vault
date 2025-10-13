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

## 📥 收集箱 (待整理)

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

## 🔥 最近更新

```dataview
TABLE WITHOUT ID
  file.link as "文件",
  dateformat(file.mtime, "yyyy-MM-dd HH:mm") as "修改时间",
  file.folder as "位置"
FROM "" AND -"Templates"
WHERE file.name != "首页" AND file.name != "Dashboard" AND file.name != "Home"
SORT file.mtime DESC
LIMIT 10
```

---

## ✨ 最近创建

```dataview
TABLE WITHOUT ID
  file.link as "文件",
  dateformat(file.ctime, "yyyy-MM-dd") as "创建日期",
  file.folder as "分类"
FROM "" AND -"Templates"
WHERE file.name != "首页" AND file.name != "Dashboard" AND file.name != "Home"
SORT file.ctime DESC
LIMIT 8
```

---

## 📌 待办任务

```dataview
TASK
WHERE !completed AND file.folder != "Templates"
GROUP BY file.link
SORT file.mtime DESC
LIMIT 15
```

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

## 🏷️ 热门标签

```dataview
TABLE WITHOUT ID
  rows.file.etags[0] as "标签",
  length(rows) as "使用次数"
FROM "" AND -"Templates"
FLATTEN file.etags as tag
WHERE file.etags
GROUP BY tag
SORT length(rows) DESC
LIMIT 12
```
---
