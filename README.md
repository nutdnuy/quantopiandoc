# QuantCorner Research Lab

Investment Research with Python: ข้อมูล สถิติ Signal กลยุทธ์ และความเสี่ยง

โปรเจกต์เว็บไซต์บทเรียนภาษาไทยที่เรียบเรียงจาก **Quantopian Lecture Series ในสำเนา quantopiandoc ที่มีอยู่ในเครื่อง** พร้อมบทนำ Python กับ AI จากข้อความที่ Nuth ส่งมา ไม่มีการค้นอินเทอร์เน็ตเพื่อเพิ่มเนื้อหาระหว่างสร้างฉบับนี้

## สิ่งที่อยู่ในโปรเจกต์

- 54 บทภาษาไทย จัดเป็น 7 หมวด ใช้หัวข้อตรงกับแนวคิดและคำว่า Signal
- Active Viz 55 ชุด ครบทุกบท ปรับค่าดูผลคำนวณด้วยข้อมูลสมมติ
- Output ที่รันจริงครบ 38 บล็อก Python ใน 29 บท พร้อม input fixtures, คำสั่งแสดงค่า และกราฟ
- ต้นฉบับครบ 92 Notebook: 52 บทเรียน, 20 แบบฝึกหัด, 20 เฉลย พร้อม HTML เดิม 91 ไฟล์
- หน้าอ่านต้นฉบับที่แสดงคำอธิบาย โค้ด ภาพ และข้อความผลลัพธ์เดิม โดยไม่โหลดสื่อภายนอก
- ค้นหาไทย/อังกฤษ, Source library, บันทึกว่าอ่านแล้ว และกลับมาอ่านต่อ
- Quantara fantasy-world edition ตามหน้า Robo Trade ของ Nuth: ภาพนักสำรวจ Quant Researcher แผนที่ และตรา QuantCorner ที่อนุมัติแล้ว พร้อมหน้าอ่านพื้นขาว สารบัญด้านซ้าย ธีมมืดให้เลือก และฟอนต์ไทยในเครื่อง
- เว็บสแตติกที่เปิดผ่าน local server หรือ `dist/index.html` ได้ โดยไม่ต้องเชื่อม API

บทภาษาไทยเป็นการเรียบเรียงเนื้อหาสำคัญใหม่ ไม่ใช่คำแปลทุกเซลล์ของ Notebook ต้นฉบับ หน้าบทเรียนอ่านได้ต่อเนื่องโดยไม่มีกล่องชวนอ่านต้นฉบับ เครดิตและสำเนาเดิมยังเก็บไว้ใน About และคลังไฟล์

## เปิดในเครื่อง

ใช้ Node.js 22 ขึ้นไป ไม่ต้องติดตั้งแพ็กเกจหรือเชื่อมอินเทอร์เน็ตสำหรับ build ปกติ

```sh
npm run build
npm test
npm run dev
```

จากนั้นเปิด `http://127.0.0.1:8765` หรือดับเบิลคลิก `Preview.command` บน Mac

`dist/` เป็นเว็บที่สร้างแล้วและย้ายไปวางบน static hosting ได้ทั้งหมด ยังไม่ได้เผยแพร่หรือเปลี่ยนเว็บไซต์ออนไลน์ในการทำงานครั้งนี้

## แก้เนื้อหา

| ตำแหน่ง | ใช้ทำอะไร |
|---|---|
| `content/*.json` | บทภาษาไทย: title, intro, objectives, body (Markdown), takeaways, exercise |
| `data/additional-lessons.json` | ที่มาของบทเพิ่มเติมจากข้อความประกอบที่ Nuth ส่งมา |
| `data/curriculum.json` | ลำดับการเรียน 7 หมวด และ ID ของทั้ง 54 หัวข้อ |
| `sources/quantopian/` | ต้นฉบับ Notebook และ HTML ที่เก็บโดยไม่แก้ไข |
| `data/extracted-sources.json` | ข้อความและโค้ดที่สกัดจาก Notebook เพื่อใช้เรียบเรียง |
| `scripts/build.mjs` | แปลงเนื้อหาเป็นหน้าเว็บและสร้างหน้าต้นฉบับ |
| `public/assets/quantara/` | ภาพ Quantara จากเว็บอ้างอิงและตรา QuantCorner แบบไม่แก้ไขภาพ |
| `data/quantara-assets.json` | ที่มา บทบาท และ SHA-256 ของภาพ/ตราที่นำมาใช้ |
| `public/style.css` | รูปแบบพื้นฐานของบทเรียน สมการ และส่วนโต้ตอบ |
| `public/quantara.css` | รูปแบบหนังสือ Quantara, sidebar และหน้าจอมือถือ |
| `public/app.js` | สารบัญ ค้นหา ธีม ความคืบหน้า และกรอง Source library |
| `src/lab-math.mjs`, `src/lab-models.mjs` | Numerical functions and deterministic teaching models |
| `src/lab-registry.mjs`, `src/ActiveLab.jsx`, `public/labs.css` | Topic mapping, accessible controls, SVG charts and tables |
| `data/code-outputs.json`, `scripts/render-code-outputs.py` | Executed Python outputs, fixtures, runtime versions and exact code hashes |
| `src/components/` | React Bits ที่ปรับเข้ากับการใช้งานของเว็บนี้ |
| `public/interactions.js` | bundle ที่เตรียมไว้สำหรับ build แบบออฟไลน์ |
| `qa/` | ผลตรวจจริงและสคริปต์ตรวจหน้าเว็บ |

ไฟล์ใน `dist/` เป็นผลลัพธ์จาก build ให้แก้ต้นทางก่อนแล้ว build ใหม่

สูตรในเนื้อหาใช้ `$...$` สำหรับ inline math และ `$$...$$` สำหรับสมการแยกบรรทัด โค้ด Python ใส่ fenced code block ตาม Markdown ปกติ

## สถานะ Notebook

Notebook ที่ดาวน์โหลดเป็น **ต้นฉบับเดิม** ไม่ได้ย้ายโค้ดทั้งชุดไปรันบน Python รุ่นใหม่ หลายบทพึ่งพา Python 2, Quantopian API และข้อมูลที่ผูกกับแพลตฟอร์มเก่า ผลที่เห็นในหน้าต้นฉบับเป็นผลที่บันทึกไว้ ไม่ใช่การรันหรือทดสอบย้อนหลังใหม่ ตัวอย่างใหม่ในบทไทยระบุว่าเป็นตัวอย่างสมมติ

## ที่มา

Source repository: `nutdnuy/quantopiandoc`

Source commit: `b1faf19ba390d6aa74429e759c3acc1ab8779932`

53 หัวข้อจาก Quantopian จับคู่กับ source paths ใน `data/build-manifest.json` ไฟล์ต้นฉบับและ exported copies ตรวจเทียบ byte-for-byte ด้วย `npm test`

ไม่มีไฟล์ LICENSE ระดับ repository ในสำเนาที่ได้รับ ชื่อผู้เขียนและข้อความระบุสิทธิ์ภายในบทเรียนยังคงอยู่ใน Notebook และหน้าต้นฉบับ ไม่ได้กำหนดใบอนุญาตใหม่ให้เนื้อหา Quantopian

## Interaction authoring

bundle มีไว้แล้วเพื่อให้ใช้งานออฟไลน์ หากแก้ React source ต้องมี local `esbuild`, `react`, `react-dom`, และ `motion` แล้วรัน:

```sh
QRL_TOOLING_ROOT='/path/to/existing/local/project' node scripts/bundle.cjs
npm run build
```

ไม่มีการเรียก `npm install` อัตโนมัติ เวอร์ชันที่ใช้ครั้งนี้และ notices อยู่ใน `THIRD_PARTY_NOTICES.md` และ `notices/`

## Quantara edition

การออกแบบใช้โลกแฟนตาซี **Quantara** ตามหน้า Robo Trade ของ QuantCorner หน้าแรกอธิบายเนื้อหาและวิธีอ่าน ใช้แผนที่กับภาพนักสำรวจ Quant Researcher จากไฟล์เดิมในเครื่องประกอบ ภาพและตรา QuantCorner คัดลอกโดยไม่แก้เนื้อภาพ; ที่มาและ hash อยู่ใน `data/quantara-assets.json`

แผนที่ `learning-atlas.png` ใช้ฉบับเดียวกับหน้าอ้างอิงเพื่อรักษาบรรยากาศ ไม่ใช้ยืนยันจำนวนหรือตำแหน่งเมือง เนื้อหาบทเรียนและสมการยังแยกจากภาพโลกสมมติ ไม่มีการเพิ่มข้อเท็จจริงตลาดจากภาพประกอบ

## Active Viz and Python outputs

All lesson charts use deterministic calculations or seeded hypothetical data. They are teaching examples, not market observations, forecasts, or evidence of strategy performance. No new Internet source or image generator was used.

The 55 Active Viz configurations cover all 54 lessons. The opening Python-and-AI chapter compares compounded wealth with a deliberately incorrect sum-of-returns method. Statistical Moments has separate Skewness and Kurtosis panels. The Kurtosis comparison standardizes all distributions to mean zero and variance one and includes a tail zoom. Controls, metrics, axes, assumptions, and reset actions remain usable in both themes; charts scroll within their panel on narrow screens.

To regenerate the 38 Python outputs, run `npm run build:outputs` with local NumPy, pandas, SciPy, statsmodels, and Matplotlib. Missing input data is supplied by explicit hypothetical fixtures shown with the example. The manifest stores the runtime and SHA-256 of every displayed code block; build fails if the code changes without fresh output. This reruns the Thai lesson examples only, not the archived Quantopian notebooks.

`npm test` checks source integrity, lesson coverage, local links, numerical models, all Active Viz mappings, and output/code hashes. Browser verification is recorded separately in `qa/`.
