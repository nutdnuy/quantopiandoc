import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lessonLabs} from '../src/lab-registry.mjs';
const lesson=JSON.parse(fs.readFileSync(new URL('../content/why-learn-python-with-ai.json',import.meta.url)));
const html=fs.readFileSync(new URL('../dist/why-learn-python-with-ai.html',import.meta.url),'utf8');
const outputs=JSON.parse(fs.readFileSync(new URL('../data/code-outputs.json',import.meta.url)));

test('Python and AI essay uses the requested opening and focuses on why and learning scope',()=>{
 assert.equal(lesson.title,'ทำไมเราต้องเรียน Python เมื่อ AI ก็ทำได้');
 assert.ok(lesson.intro.startsWith('หลายคนคงเคยมีคำถามว่า “ในปัจจุบัน AI เขียน Code ได้อยู่แล้ว เราจะเรียน Python ไปทำไม?”'));
 assert.equal(lesson.format,'essay');
 assert.ok(lesson.body.includes('เรียน Python ถึงระดับไหน'));
 assert.ok(!/Kaggle|Portfolio|ตรวจผลตอบแทน|100|110|99|```/.test(JSON.stringify(lesson)));
});

test('removed tutorial, output, Active Viz and takeaway box stay out of the page',()=>{
 assert.equal(lessonLabs(lesson.id).length,0);
 assert.equal(outputs.lessons[lesson.id],undefined);
 assert.deepEqual(lesson.takeaways,[]);
 assert.ok(!/data-active-lab|data-code-output|class="takeaways"|href="#takeaways"|href="#lab-55"|Kaggle|ตรวจผลตอบแทน/.test(html));
 assert.ok(html.includes('href="introduction-to-research.html"'));
});

test('the following practice lesson keeps its existing experiment and takeaway section',()=>{
 const next=fs.readFileSync(new URL('../dist/introduction-to-research.html',import.meta.url),'utf8');
 assert.ok(next.includes('data-active-lab="lab-1"'));
 assert.ok(next.includes('id="takeaways"'));
 assert.ok(next.includes('href="#takeaways"'));
});
