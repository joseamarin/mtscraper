(function(window, document) {
	'use strict';

	const template = "ADV (9) Green and (1397) Lillypad 4 Packages:\n\nHi Team,\n\nPlease find your offer ADV here listed below and attached:\n\nOffer(s):\n(ID) ADV\n\nAffiliate(s):\nGreen (9)\nLillypad4 (1397)\n\nCreative(s):\nCreative Name here\n\nSubject Line(s):\nSL\n\nFrom Line(s):\nFL\n\nUnsubscribe URL:\nUNSUB\n\nPreapproval seeds:\n\nzxtest@zetainteractive.com\n\nThanks.";

	const advName = document.getElementsByTagName('input')[3].attributes.value.nodeValue;

	const subFromReplace = sl => {
		sl = sl.replace(/\(Active - A - AA \)/g, '');
		sl = sl.replace(/^[0-9]{0,9999}/g, '');
		sl = sl.replace(/-/, '');
		return sl;
	}

	if (document.getElementsByName('csubject')[0].length === 1) {
		const sl = document.getElementsByName('csubject')[0].innerText;
		subFromReplace(sl);
	}

	const sl = document.getElementsByName('csubject')[0];
	const subs = [];
	Array.from(sl).forEach(e => {
		subs.push(subFromReplace(e.innerText));
	});

	if (document.getElementsByName('from')[0].length === 1) {
		const fl = document.getElementsByName('from')[0].innerText;
		subFromReplace(fl);
	}

	const fl = document.getElementsByName('from')[0];
	const froms = [];
	Array.from(fl).forEach(e => {
		froms.push(subFromReplace(e.innerText));
	});

	const tenthTable = document.getElementsByTagName('table')[10].innerHTML;
	const cakeOfferId = tenthTable.substring(1219603, 1219637).substring(29);

	const unsub = document.getElementsByName('unsub_link')[0].attributes.value.nodeValue;

	const buildEmail = template => {
		template = template.replace(/ADV/g, advName);
		template = template.replace(/ID/g, cakeOfferId);
		template = template.replace(/SL/g, subs.join('\n'));
		template = template.replace(/FL/g, froms.join('\n'));
		template = template.replace(/UNSUB/g, unsub);
		return template;
	}

	const textarea = document.createElement('textarea');
	textarea.classList.add('js-tmp');
	textarea.innerHTML = buildEmail(template);
	const textToCopy = document.querySelector('.js-tmp');
	document.querySelector('table').appendChild(textarea);
	textarea.focus();
	textarea.select();

	try {
		document.execCommand('copy');
	}
	catch (err) {
		alert('Copy not supported' + err);
	}
	finally {
		document.querySelector('table').removeChild(textarea);
	}
})(this, document);
