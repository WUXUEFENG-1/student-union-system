const { makeListPage } = require('../../utils/list-page');
const ui = require('../../utils/ui');
const store = require('../../utils/store');

const page = makeListPage({
  title: '活动报名',
  key: 'events',
  detail: 'event',
  filter: () => true,
  mapRow: (a, ctx) => {
    const signups = a.signups || [];
    const signed = signups.some((s) => s.name === ctx.cur.name);
    const quota = a.quota || a.total || 0;
    const canSign = a.status === '报名中' && !signed && (!quota || signups.length < quota);
    return {
      id: a.id,
      detail: 'event',
      title: a.title || '活动报名',
      sub1: `${a.publisher || ''} · ${a.place || ''}`,
      sub2: `${a.start || ''} ~ ${a.end || ''}｜名额 ${signups.length}/${quota || '—'}`,
      status: a.status || '报名中',
      tone: ui.toneClass(a.status || '报名中'),
      canDel: store.allPower(),
      signed, canSign
    };
  },
  actions: [
    {
      act: 'sign',
      run(page, id, ctx) {
        const e = (ctx.db.events || []).find((x) => x.id === id);
        if (!e) return;
        e.signups = e.signups || [];
        e.signups.push({ name: ctx.cur.name, sno: ctx.cur.sno || '—', dept: ctx.cur.dept, date: store.today(), status: '已报名' });
        store.commit('活动报名', e.title);
        page.refresh();
        wx.showToast({ title: '报名成功', icon: 'none' });
      }
    },
    {
      act: 'cancel',
      run(page, id, ctx) {
        const e = (ctx.db.events || []).find((x) => x.id === id);
        if (!e) return;
        e.signups = (e.signups || []).filter((s) => s.name !== ctx.cur.name);
        store.commit('取消报名', e.title);
        page.refresh();
      }
    }
  ]
});

Page(page);
