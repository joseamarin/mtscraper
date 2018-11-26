(function(window, document) {
	'use strict';

	function OfferLinkDirector ( strategyFactory ) {
		this.factory = strategyFactory;

		if ( !this.factory ) {
			this.factory = new OfferIdParserFactory();
		}

		this.getOfferId = function ( rawContext ) {
			const strategyList = [ 'Cid' , 'Oid' , 'Oxid' ];
			let currentStrategyName;
			while ( currentStrategyName = strategyList.pop() ) {
				let strategy = this.factory[ 'get' + currentStrategyName + 'Strategy' ]();

				if ( strategy.isValidContext( rawContext ) ) {
					return strategy.extractOfferId( rawContext );
				}
			}
		};
	}

	function OfferIdStrategy ( validityHandler , extractionHandler ) {
		this.config = {
			"validate" : validityHandler ,
			"extract" : extractionHandler
		};

		this.isValidContext = function ( rawContext ) {
			return this.config.validate( rawContext );
		};

		this.extractOfferId = function ( rawContext ) {
			return this.config.extract( rawContext );
		}
	}

	const OfferIdParserFactory = function () {
		const self = this;

		self.getDirector = function () {
			return new OfferLinkDirector( self );
		};

		self.getCidStrategy = function () {
			return new OfferIdStrategy(
				function ( rawContext ) {
					const context = rawContext.substring( rawContext.indexOf( 'Cake Offer ID::' ) ).substring( 28 );
					const isNotNull = ( context.match( /^[0-9]/g ) !== null );
					const regexMatches = context.match( /^([0-9])(\d+)/g );
					if ( isNotNull && context.match( /^[0-9]/g )[ 0 ] ) {
						return isNotNull && context.match( /^[0-9]/g )[ 0 ][ 'length' ] === 1 &&
							Number( context.match( /^([0-9])/g )[ 0 ] > 0 );
					}
					else {
						return isNotNull && regexMatches[ 0 ] !== null && Number( regexMatches[ 0 ] ) > 0;
					}

				} ,
				function ( rawContext ) {
					if (rawContext
						.substring( rawContext.indexOf( 'Cake Offer ID::' ) )
						.substring( 28 ).match( /^[0-9](\d+)|^[0-9]/g )[ 0 ][ 'length' ] === 1)
					{
						return rawContext
							.substring( rawContext.indexOf( 'Cake Offer ID::' ) )
							.substring( 28 )
							.match( /^([0-9])/g )[ 0 ];
					}
					return rawContext
						.substring( rawContext.indexOf( 'Cake Offer ID::' ) )
						.substring( 28 )
						.match( /^([0-9])(\d+)/g )[ 0 ];
				}
			);
		};

		self.getOidStrategy = function () {
			return new OfferIdStrategy(
				function ( rawContext ) {
					const context = rawContext.substring( rawContext.indexOf( '?o=' ) );
					const regexMatches = context.match( /\?o=(\d+)([a-zA-Z$!#]+)?&.+/ );

					return regexMatches !== null && Number( regexMatches[ 1 ] ) > 0;
				} ,
				function ( rawContext ) {
					return rawContext
						.substring( rawContext.indexOf( '?o=' ) )
						.match( /\?o=(\d+)([a-zA-Z$!#]+)?&.+/ )[ 1 ];
				}
			);
		};

		self.getOxidStrategy = function () {
			return new OfferIdStrategy(
				function ( rawContext ) {
					const context = rawContext.substring( rawContext.indexOf( 'oxid=' ) );
					const regexMatches = context.match( /\oxid=(\d+)([a-zA-Z$!#]+)?&.+/ );

					return regexMatches !== null && regexMatches[ 1 ] > 0;
				} , 
				function ( rawContext ) {
					return rawContext
						.substring( rawContext.indexOf( '?oxid=' ) )
						.match( /\oxid=(\d+)([a-zA-Z$!#]+)?&.+/ )[ 1 ];
				}
			);
		};
	};


	/**
	 *  *  * Main Script
	 *   *   */
	const director = new OfferLinkDirector();

	let cakeOfferId;
	if (cakeOfferId = director.getOfferId(document.getElementsByTagName('table')[10].innerHTML)) {
		cakeOfferId = director.getOfferId(
			document.getElementsByTagName('table')[10].innerHTML
		);
	}
	else {
		cakeOfferId = 'Cake Offer ID Not found';
	}

	const advertiserName = document.getElementsByTagName('input')[3].attributes.value.nodeValue;

	const subFromFilter = (unfilteredContext) => {
		return unfilteredContext
			.replace(/\(Active - A - AA \)/g, '')
			.replace(/\(Active - O - AA \)/g, '')
			.replace(/^[0-9]{0,}/g, '')
			.replace(/^[0-9]{0,}/g, '')
			.replace(/-/, '')
			.replace(/\(Inactive - A - NA! \)/g, '')
			.replace(/^.*\(Inactive - A - AA \)/g, '');
	}

	const createArray = (domElement) => {
		const arr = [];
		Array.from(domElement).forEach((s) => {
			arr.push(subFromFilter(s.innerText));
		});
		return arr.join('\n').split('\n')
			.map(function(v) {
				return v.trim()
			}).filter(function(v) {
				return v != '';
			}).join('\n');
	}

	const subs = createArray(document.getElementsByName('csubject')[0]);
	const froms = createArray(document.getElementsByName('from')[0]);

	const unsub = document.getElementsByName('unsub_link')[0].attributes.value.nodeValue;

	const pkgTemplate = "ADV (9) Green and (1397) PlutoC Packages:\n\nHi Team,\n\nPlease find your offer ADV here listed below and attached:\n\nOffer(s):\n(ID) ADV\n\nAffiliate(s):\nGreen (9)\nPlutoC (1397)\n\nCreative(s):\nCreative Name here\n\nSubject Line(s):\nSL\n\nFrom Line(s):\nFL\n\nUnsubscribe URL:\nUNSUB\n\nPreapproval seeds:\nzxtest@zetainteractive.com\n\nThanks.";

	const buildEmail = pkgTemplate => {
		pkgTemplate = pkgTemplate.replace(/ADV/g, advertiserName);
		pkgTemplate = pkgTemplate.replace(/ID/g, cakeOfferId);
		pkgTemplate = pkgTemplate.replace(/SL/g, subs);
		pkgTemplate = pkgTemplate.replace(/FL/g, froms);
		// pkgTemplate = pkgTemplate.replace(/UNSUB/g, unsub);
		return pkgTemplate;
	}

	const textarea = document.createElement('textarea');
	textarea.classList.add('js-tmp');
	textarea.innerHTML = buildEmail(pkgTemplate);
	const textToCopy = document.querySelector('.js-tmp');
	document.querySelector('table').appendChild(textarea);
	textarea.focus();
	textarea.select();

	const copyEmailTemplate = () => {
		try {
			document.execCommand('copy');
		}
		catch (err) {
			alert('Copy not supported' + err);
		}
		finally {
			document.querySelector('table').removeChild(textarea);
		}
	}

	const ffCopyEmailTemplate = () => {
		document.body.appendChild(textarea);
		textarea.focus();
		textarea.select();
		try {
			document.execCommand('copy');
		}
		catch (err) {
			alert('Copy not supported' + err);
		}
		finally {
			document.body.removeChild(textarea);
		}
	}

	const renderEmailTemplate = () => {
		const div = document.createElement('div');
		const header = document.createElement('div');
		const headerText = document.createElement('p');
		const root = document.getElementsByTagName('table')[0];
		const copyBtn =  document.createElement('button');
		copyBtn.style.backgroundImage = 'url(https://raw.githubusercontent.com/joseamarin/mtscraper/master/assets/copy.gif)';
		copyBtn.style.position = 'fixed';
		copyBtn.style.top = '50%';
		copyBtn.style.right = '50%';
		copyBtn.style.height = '25px';
		copyBtn.style.width = '55px';
		copyBtn.style.backgroundRepeat = 'no-repeat';
		copyBtn.style.backgroundSize = 'cover';
		root.style.display = 'none';
		div.innerText = textarea.textContent;
		header.style.backgroundColor = '#509C10';
		headerText.innerText = 'Email Package Template'
		headerText.style.color = '#fff';
		headerText.style.fontFamily = 'Verdana,Arial,Helvetica,sans-serif';
		headerText.style.fontSize = '13px';
		headerText.style.textAlign = 'center';
		headerText.style.fontWeight = 'bold';
		headerText.style.margin = 0;
		div.style.backgroundColor = '#E3FAD1';
		header.appendChild(headerText);
		document.body.appendChild(header);
		document.body.appendChild(div);
		div.appendChild(copyBtn);
		copyBtn.addEventListener('click', event => {
			ffCopyEmailTemplate();
			root.style.display = 'block';
			document.body.removeChild(div);
			document.body.removeChild(header);
			textarea.style.display = 'none';
			copyBtn.style.display = 'none';
		});
	}

	const browser = navigator.userAgent.toLowerCase();
	browser.indexOf('firefox') > -1 ? renderEmailTemplate() : copyEmailTemplate();
})(this, document);
