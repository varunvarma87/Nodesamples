/*global define:true, console:true, jQuery:true, require:true */
define(['nougat', 'jquery', 'backbone', 'BaseView', 'widgets/pageView'],
	function (nougat, $, Backbone, BaseView, ContentView) {

		'use strict';

		var pageView, viewCache = {}, AP = Array.prototype, cslice = Function.call.bind(AP.slice), now = Date.now || function () {
			return new Date().getTime()
		};

		/**
		 * calls the afterAttach function on the view
		 * if present, after the view is attached to the dom.
		 *
		 * This will allow for the view to do math after attachment if
		 * necessary.
		 *
		 * @param view
		 */
		function afterAttached(view) {
			if (view.afterAttach) {
				view.afterAttach();
			}
		}

		return Backbone.Router.extend({
			country: $('#content').attr('data-country'),
			/* Detect if the browser supports HTML5 push state */
			hasPushState: window.history && 'pushState' in window.history,

			// Register all URIs
			routes: {
				//retry route.   So we can navigate ourselves back to ourselves.
				'r/*stuff': function (path) {
					this.navigate(path, {trigger: true});
				},
				'bankflow(/)': function () {
					return this.spaView('bankLogos');
				},
				'bankflow/:view': function (path) {
					return this.spaView(!path ? 'bankLogos' : path);
				},
				'bankflow/:view/:bankId': function (view, bankId) {
					return this.spaView(view, {bankId: bankId});
				},
				'addBank': 'showView',
				'confirmBank': 'showView',
				'linkBankSuccess': 'showView',
				'': 'showLanding',
				"*actions": 'defaultRoute'
			},
			_extractParameters: function(route, fragment) {
				fragment = (fragment || '').split('?').shift();
				return Backbone.Router.prototype._extractParameters.call(this, route, fragment);
			},
			defaultRoute: function () {


			},
			renderErrorView: function (data) {
				this.renderView('errorView', data, '#notificationBox').then(function (view) {
					this._errorView = view;
				}.bind(this));
			},
			hideErrorView: function () {
				if (this._errorView) {
					var ev = this._errorView;
					this._errorView = null;
					//yuck, fix webkit issue with not redrawing.
					ev.$el.fadeOut(function () {
						var el = $(this).parent()[0];
						el.style.display = 'none';
						el.offsetHeight;
						el.style.display = '';
						ev.remove();
					});
				}
			},
			$busyNode: $('<div class="loading"><i class="busy"></i></div>'),
			/**
			 *
			 * @param {string} view - The view to render
			 * @param {options} opts
			 * @param {element} ele
			 */
			renderView: function (vName, opts, ele, animate, showBusy) {
				animate = animate || {};
				var subView = viewCache[ele], $ele = $(ele), p = $.Deferred(), op = $.Deferred(), track = function (name) {
					Backbone.trigger.apply(Backbone, ['analytics:trackLink:fab'].concat(vName.split('/').concat('', name).join(':').toLowerCase(), cslice(arguments, 1)));
				}, $busyNode = this.$busyNode, start;
				ele = $ele.selector;
				p.then(afterAttached);
				this._isViewLoaded = true;
				if (showBusy) {
					op.then(function () {
						$ele.html($busyNode.clone());
						start = now();
					});
				}
				track('pre-render');
				if (subView) {
					op.then(subView.remove.bind(subView));
					subView.$el.fadeOut(op.resolve);
				} else {
					op.resolve();
				}

				require(['view/' + vName], function onSpaViewRequire(View) {
					View.prototype.className = (View.prototype.className || '') + ' ' + vName.replace(/\//g, ' ');
					View.prototype._track = track;
					View.prototype._url = '/fmx/' + vName;
					var view = new View(opts), attachOnRender = function () {
						var delta = now() - (start || 0), to = showBusy ? Math.max(500 - delta, 0) : 0;
						var args = arguments;
						setTimeout(Function.apply.bind(function () {
							viewCache[ele] = view;
							$ele.html(view.$el.hide());
							view.$el.fadeIn(animate);
							p.resolve.apply(p, AP.concat.apply([view], args));
						}), to);

					};
					view.on('remove', function () {
						delete viewCache[ele];
					});

					if (view && view.asyncRender) {
						$.when(view.asyncRender(), op).fail(p.error).done(attachOnRender);
					} else {
						op.then(view.render).done(attachOnRender);
					}


				}, p.error);

				p.then(function () {
					track('post-render-post-attach')
				}, function () {
					track('post-render-post-error')
				});
				return p;

			},
			/**
			 * This takes a view and tries to load the left hand content, in sync with the right hand content.
			 *
			 * @param view
			 * @param opts
			 * @returns {*}
			 */
			spaView: function router$spaView(view, opts) {
				var animate = {
					queue: 'spaQueue'
				};

				return this.renderView('bankflow/' + view, opts, '#subView', animate, true).fail(function (data) {
					return data;
				}).always(function (v1, content, template, data) {
					(this._contentView ? this._contentView.handler(view, data, animate) : this.renderView('bankflow/contentView', data || this._data, '#contentView', animate)).fail(function (data) {
						return data;
					}).always(function (v2) {
						this._contentView = v2;
						$(v1.$el).add(v2.$el).dequeue(animate.queue);
					}.bind(this));
				}.bind(this));
			},

			/**
			 * default landing  view
			 */
			/*showLanding: function router$showLanding(viewName) {
				var viewsList = ['fmx/linkBankSuccess', 'fmx/bankflow'];
				if (jQuery.inArray(viewName, viewsList) > -1) {
					viewName = viewName.replace('fmx/', '');
				}
				this.showView(viewName);

			},*/

			/**
			 * show particular view
			 * @param name
			 */
			showView: function router$showView(name) {
				var viewName = name || Backbone.history.fragment || window.location.pathname.replace('/fmx/', ''),
					asyncAssets;
				if (this.country === 'AU' && (viewName === 'create' || viewName === 'addCard')) {
					require(['view/address']);
				}
				if (viewName === 'directDebitAgreementPrint' || viewName === 'sepaMandate' || viewName === "bankDirectDebit") {
					asyncAssets = ['view/bankAuth'];
				} else {
					asyncAssets = ['view/' + viewName];
				}

				require(asyncAssets, function (view) {
					pageView.activate(view);
				});
			},

			/**
			 * initialize the router
			 */
			initialize: function () {
				var context,
					hash = (window.location.hash || '').replace(/^#/, ''),
					fragment = (hash && hash.length === 0) ? hash : window.location.pathname.replace(/^\/fmx\//, ''), viewName;
				// Grab data from the page context
				nougat.setContext($(document.body).data());

				context = nougat.getContext();

				viewName = context.viewName;

				if (viewName !== 'index') {
					$(document.body).removeClass('loading');
					document.body.removeAttribute('data-view-name');
				}

				// build the Ajax'd content UI
				pageView = new ContentView();

				// Start watching the history
				// Note: Remove the existing hash if there is one
				//  if (window.location.hash) {
				//      window.location.hash = '';
				//  }

				// start recording history for backbone for Ajax'd content
				Backbone.history.start({
					pushState: this.hasPushState, // Use HTML5 Push State
					root: "/fmx/", //Initial path for app,
					silent:true
				});

				//  if (!(this.hasPushState || hash)) {
				Backbone.history.loadUrl(fragment);
				//  }

				//Make perculated links popstate friendly.
				$('body').on('click', 'a[href]', function (e) {
					var href = $(e.currentTarget).attr('href');
					if (!!~href.indexOf('bankflow') && $('#subView').length) {
						e.preventDefault();
						this.navigate(href, {trigger: true});
					}
				}.bind(this));
				var backMagic = _.bind(function backMagic() {
					if (~window.location.pathname.indexOf('bankflow')) {
						if (!window.location.hash) {
							var navigateTo = location.pathname.replace(/^\/fmx/, '').replace(/\/*$/, '');
							Backbone.history.loadUrl(navigateTo);
						}
					}
				}, this);

				//Make the backbutton do its magic.
				if (this.hasPushState) {
					$(window).on('popstate', backMagic);
				} else {
					$(window).on('hashchange', backMagic);

				}
				Backbone.on('error:globalErrorMessage', this.renderErrorView, this);
				Backbone.on('error:hideGlobalErrorMessage', this.hideErrorView, this);
			}
		});

	});
