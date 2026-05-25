const fs = require("fs-extra");
const log = require("../logger/log.js");
const path = require("path");

// تحديد ملف اللغة الخاص ببوت 『 نـانـيـكـا ⚡』
let pathLanguageFile = `${__dirname}/${global.GoatBot.config.language}.lang`;

// إذا لم يتم العثور على ملف اللغة يتم استخدام الإنجليزية افتراضياً
if (!fs.existsSync(pathLanguageFile)) {
	log.warn(
		"LANGUAGE",
		`تعذر العثور على ملف اللغة ${global.GoatBot.config.language}.lang، سيتم استخدام ملف اللغة الافتراضي "${__dirname}/en.lang"`
	);

	pathLanguageFile = `${__dirname}/en.lang`;
}

// قراءة ملف اللغة
const readLanguage = fs.readFileSync(pathLanguageFile, "utf-8");

// تصفية الأسطر الفارغة والتعليقات
const languageData = readLanguage
	.split(/\r?\n|\r/)
	.filter(
		line =>
			line &&
			!line.trim().startsWith("#") &&
			!line.trim().startsWith("//") &&
			line != ""
	);

// حفظ بيانات اللغة داخل global
global.language = convertLangObj(languageData);

/**
 * تحويل ملف اللغة إلى Object
 */
function convertLangObj(languageData) {
	const obj = {};

	for (const sentence of languageData) {

		// استخراج مكان علامة =
		const getSeparator = sentence.indexOf('=');

		// المفتاح
		const itemKey = sentence.slice(0, getSeparator).trim();

		// القيمة
		const itemValue = sentence
			.slice(getSeparator + 1, sentence.length)
			.trim();

		// اسم القسم
		const head = itemKey.slice(0, itemKey.indexOf('.'));

		// اسم المفتاح
		const key = itemKey.replace(head + '.', '');

		// تحويل \n إلى سطر جديد
		const value = itemValue.replace(/\\n/gi, '\n');

		// إنشاء القسم إذا لم يكن موجوداً
		if (!obj[head])
			obj[head] = {};

		// حفظ القيمة
		obj[head][key] = value;
	}

	return obj;
}

/**
 * جلب النصوص من ملف اللغة
 */
function getText(head, key, ...args) {

	let langObj;

	// إذا تم تمرير Object يحتوي على لغة مخصصة
	if (typeof head == "object") {

		let pathLanguageFile = path.normalize(
			`${__dirname}/${head.lang}.lang`
		);

		head = head.head;

		// التحقق من وجود ملف اللغة
		if (!fs.existsSync(pathLanguageFile)) {

			log.warn(
				"LANGUAGE",
				`تعذر العثور على ملف اللغة ${pathLanguageFile}، سيتم استخدام اللغة الافتراضية "${path.normalize(`${__dirname}/en.lang`)}"`
			);

			pathLanguageFile = `${__dirname}/en.lang`;
		}

		// قراءة ملف اللغة
		const readLanguage = fs.readFileSync(pathLanguageFile, "utf-8");

		const languageData = readLanguage
			.split(/\r?\n|\r/)
			.filter(
				line =>
					line &&
					!line.trim().startsWith("#") &&
					!line.trim().startsWith("//") &&
					line != ""
			);

		langObj = convertLangObj(languageData);
	}

	// استخدام اللغة العامة
	else {
		langObj = global.language;
	}

	// إذا لم يتم العثور على النص
	if (!langObj[head]?.hasOwnProperty(key))
		return `❌ تعذر العثور على النص: "${head}.${key}"`;

	// جلب النص
	let text = langObj[head][key];

	// استبدال المتغيرات مثل %1 و %2
	for (let i = args.length - 1; i >= 0; i--)
		text = text.replace(
			new RegExp(`%${i + 1}`, 'g'),
			args[i]
		);

	return text;
}

// تصدير الدالة
module.exports = getText;

// 👑 المطور الرسمي: أؤمو عبد العزيز قدوري
// 🤖 اسم البوت: 『 نـانـيـكـا ⚡』
