import { createWidget } from 'discourse/widgets/widget';
import { wantsNewWindow } from 'discourse/lib/intercept-click';
import { h } from 'virtual-dom';


createWidget('lm-preheader-user-login-buttons', {
  tagName: 'div.login-buttons',

  click (e) {
    e.preventDefault();
    this.sendWidgetAction(this.attrs.action);
  },

  html (attrs, state) {
    return [
      h('a.login-button', 'Войти'),
      h('a.signup-button', 'Регистрация')
    ];
  }
});


createWidget('lm-preheader-user-menu', {
  tagName: 'a.user-menu',

  click (e) {
    e.preventDefault();
    this.sendWidgetAction(this.attrs.action);
  },

  html (attrs, state) {
    return [
      h('span.avatar'),
      h('span.username', attrs.user.get('username')),
      h('i.icon.fa.fa-caret-down')
    ];
  }
});


export default createWidget('lm-preheader-user-panel', {
  tagName: 'div.user-panel',

  buildKey () {
    return 'lm-preheader-user-panel'
  },

  defaultState () {
    this.appEvents.one('dom:clean', () => {
      Ember.run.scheduleOnce('afterRender', () => {
        this.state.panel_visible = false;
        this.scheduleRerender();
      });
    });

    return {
      panel_visible: false
    };
  },

  html (attrs, state) {
    const content = [];
    const app = this.register.lookup('controller:application');
    const user = app.get('currentUser');

    if (user) {
      content.push(
        this.attach('lm-preheader-user-menu', {
          action: 'toggleMenu',
          user: user
        })
      );
      if (this.state.panel_visible) {
        content.push(
          h('div.user-menu-items', [
            this.attach('link', {
              className: 'user-menu-item',
              href: user.get('path'),
              rawLabel: 'Моя страница',
              icon: 'user'
            }),
            this.attach('link', {
              className: 'user-menu-item',
              action: 'logout',
              rawLabel: 'Выход',
              icon: 'sign-out'
            })
          ])
        );
      }
    } else {
      content.push(
        this.attach('lm-preheader-user-login-buttons', {
          action: 'login'
        })
      );
    }

    return content;
  },

  domClean () {
    this.closeMenu();
  },

  linkClickedEvent () {
    this.closeMenu();
  },

  login () {
    const returnPath = encodeURIComponent(window.location.pathname);
    window.location = Discourse.getURL('/session/sso?return_path=' + returnPath);
  },

  logout () {
    this.container.lookup('route:application').send('logout')
  },

  toggleMenu () {
    this.state.panel_visible = !this.state.panel_visible;
  },

  closeMenu () {
    this.state.panel_visible = false;
  }

});
