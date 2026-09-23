import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  House, CalendarDays, Shirt, UsersRound, Menu, Plus, Search, WifiOff, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownLeft, Droplet, Check, TriangleAlert, Phone, Clock, X, Lock, Minus, Info, RotateCw,
  ShieldCheck, Hourglass, CalendarClock, Flag, Settings, ChartNoAxesCombined, MessageCircle, Scissors,
} from 'lucide';

/* ═════════════════════════════════════════════════════════════════════════
   WedHub · Home (“Today”)
   One screen. No preview chrome. Flip the values below to see other states.

   Flutter map:  TopBar → AppBar · OverdueBand → red Container above the list
   Timeline → CustomScrollView · TimeSlot → Row(time column, EventGroup)
   EventRow → InkWell · Sheet → showModalBottomSheet / Dialog · Toast → SnackBar
   Plain CSS only: custom properties, flex, grid. No clip-path, no pseudo-tricks
   beyond the spine line and dots (CustomPainter / Container in Flutter).
   ═════════════════════════════════════════════════════════════════════════ */

export const CONFIG = {
  role: 'staff',      // 'staff' | 'manager' | 'owner'
  online: true,       // true | false | 'auto' (follows the device connection)
  scenario: 'busy',   // 'busy' | 'nooverdue' | 'quiet' | 'error'
  now: null,          // null = device clock · or minutes since midnight, e.g. 680 = 11:20 AM
};

const CSS = `/* ── Tokens ─────────────────────────────────────────────────────────── */
.wh{
  --paper:#FAF7F0; --surface:#FFFEFB; --sand:#F1EADB; --line:#E3DAC7; --line-2:#CFC4AB;
  --ink:#1F1B17; --ink-2:#5C5448; --ink-3:#8A806F;
  --pickup:#2A3A8F; --return:#8F4A0F; --wash:#0E6A64;
  --red:#B3261E; --red-d:#7E1710; --amber:#7A4E00; --gold:#B8891F;
  --serif:'Playfair Display','Iowan Old Style','Palatino Linotype',Georgia,serif;
  --sans:'DM Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  /* type scale — six sizes, nothing else. fs-body now covers what fs-label used to (base text, sub-lines, inputs). */
  --fs-display:42px; --fs-h2:22px; --fs-title:20px; --fs-body:15px; --fs-time:20px; --fs-meta:13px;
  --r-lg:16px; --r-md:12px; --r-sm:8px;
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px; --s7:48px;
  --rail:72px;
  --gutter:clamp(24px, 5vw, 72px);
  font:400 var(--fs-body)/1.4 var(--sans); letter-spacing:.005em; color:var(--ink); background:var(--paper);
  min-height:100vh; -webkit-font-smoothing:antialiased;
}
.wh *,.wh *::before,.wh *::after{box-sizing:border-box}
:where(.wh) button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;padding:0}
:where(.wh) button:disabled{cursor:not-allowed}
:where(.wh) a{color:inherit}
:where(.wh) h1,:where(.wh) h2,:where(.wh) h3,:where(.wh) p,:where(.wh) ul{margin:0;padding:0}
:where(.wh) ul{list-style:none}
:where(.wh) svg{flex:none}
.wh :focus-visible{outline:3px solid #5B6BE0;outline-offset:2px}
.overline{font:700 12px/1 var(--sans);letter-spacing:.09em;text-transform:uppercase;color:var(--ink-2)}

/* ── Top bar (desktop) ──────────────────────────────────────────────── */
.top{position:sticky;top:0;z-index:20;height:60px;display:flex;align-items:center;gap:var(--s5);padding:0 var(--gutter);background:var(--surface);border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:var(--fs-title);letter-spacing:-.01em}
.mark{width:28px;height:28px;border-radius:8px;background:var(--ink);color:var(--gold);display:grid;place-items:center;font:700 17px/1 var(--serif)}
.nav{display:flex;gap:2px;align-self:stretch}
.nav button{padding:0 12px;font-weight:600;color:var(--ink-2);position:relative}
.nav button:hover{color:var(--ink)}
.nav button.on{color:var(--ink)}
.nav button.on::after{content:'';position:absolute;left:12px;right:12px;bottom:-1px;height:3px;background:var(--gold)}
.top .sp{flex:1}
.iconbtn{width:44px;height:44px;border-radius:var(--r-md);display:grid;place-items:center;color:var(--ink-2)}
.iconbtn:hover{background:var(--sand);color:var(--ink)}
.btn-new{height:42px;padding:0 var(--s4) 0 var(--s3);border-radius:var(--r-md);background:var(--ink);border:2px solid var(--gold);color:#fff;display:inline-flex;align-items:center;gap:var(--s2);font-weight:700}
.btn-new kbd{font:600 12px var(--sans);padding:1px 6px;border-radius:5px;background:rgba(255,255,255,.16);margin-left:4px}
.btn-new.locked{background:transparent;color:var(--ink);border:2px dashed var(--ink-3)}
.btn-new.locked kbd{display:none}
.avatar{width:34px;height:34px;border-radius:50%;background:var(--sand);display:grid;place-items:center;font-weight:700;font-size:var(--fs-meta)}
.pill{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 var(--s3);border-radius:99px;font-weight:700;font-size:var(--fs-meta);white-space:nowrap}
.pill.alert{background:var(--red);color:#fff}
.pill.offline{border:2px dashed var(--ink);background:var(--surface)}
.banner{display:flex;align-items:center;gap:var(--s3);padding:var(--s3) var(--gutter);background:var(--sand);border-bottom:1px solid var(--line);font-size:var(--fs-body)}

/* ── Overdue band ───────────────────────────────────────────────────── */
.od{background:var(--red);color:#fff;border-top:4px solid var(--red-d);scroll-margin-top:60px}
.od-in{padding:var(--s4) var(--gutter) var(--s2)}
.od-head{display:flex;align-items:center;gap:var(--s3);font-weight:700;font-size:var(--fs-title);margin-bottom:var(--s2)}
.od-collapse{margin-left:auto;width:36px;height:36px;border-radius:var(--r-sm);display:grid;place-items:center;color:#fff;flex:none}
.od-collapse:hover{background:rgba(255,255,255,.15)}
.od-mini{scroll-margin-top:60px}
.od-mini-row{display:flex;align-items:center;gap:var(--s3);width:100%;min-height:48px;padding:0 var(--gutter);font-weight:700;font-size:var(--fs-body);color:#fff;text-align:left}
.od-mini-row span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.od-row{display:grid;grid-template-columns:112px minmax(0,1fr) auto;gap:var(--s4);align-items:center;padding:var(--s3) 0;border-top:1px solid rgba(255,255,255,.3)}
.od-late{font-weight:700;font-size:var(--fs-title);line-height:1.15}
.od-who b{font-size:var(--fs-title);font-weight:700}
.od-who span{opacity:.9}
.od-meta{font-size:var(--fs-body);margin-top:2px;opacity:.95}
.od-block{display:flex;align-items:center;gap:6px;font-size:var(--fs-body);font-weight:700;margin-top:6px}
.od-btns{display:flex;gap:var(--s2)}
.od-btn{height:44px;padding:0 var(--s4);border-radius:var(--r-md);border:2px solid #fff;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:var(--s2);text-decoration:none;color:#fff;white-space:nowrap}
.od-btn.solid{background:#fff;color:var(--red-d)}
.od-btn.locked{border-style:dashed}
.od-more{padding:var(--s3) 0 var(--s2);border-top:1px solid rgba(255,255,255,.3);font-weight:700}
.od-clear{padding:var(--s4) var(--gutter) 0;display:flex;align-items:center;gap:var(--s2);font-size:var(--fs-body);color:var(--ink-2);font-weight:500}
.od-clear + .page{padding-top:var(--s4)}

/* ── Page ───────────────────────────────────────────────────────────── */
.page{max-width:1440px;margin:0 auto;padding:var(--s6) var(--gutter) 96px;display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:56px;align-items:start}
.dayhead{display:flex;justify-content:space-between;align-items:flex-end;gap:var(--s4);margin-bottom:var(--s6)}
.dayhead h1{font:700 var(--fs-display)/1.15 var(--serif);letter-spacing:-.02em;margin-top:var(--s2);display:inline-block;padding-bottom:10px;border-bottom:3px solid var(--gold)}
.daynav{display:flex;align-items:center;gap:var(--s1)}
.daynav .iconbtn{background:var(--surface);color:var(--ink)}
.textbtn{height:44px;padding:0 var(--s3);font-weight:700;font-size:var(--fs-body);text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line-2)}

/* ── Timeline ───────────────────────────────────────────────────────── */
.tl{position:relative}
.tl::before{content:'';position:absolute;top:8px;bottom:8px;left:var(--rail);border-left:1px solid var(--line-2)}
.slot{display:grid;grid-template-columns:var(--rail) minmax(0,1fr);margin-bottom:var(--s5);position:relative}
.time{padding:12px 18px 0 0;text-align:right;font:700 var(--fs-time)/1 var(--serif);font-variant-numeric:lining-nums tabular-nums;position:relative}
.time small{display:block;margin-top:5px;font:700 11px/1 var(--sans);letter-spacing:.06em;color:var(--ink-2)}
.time::after{content:'';position:absolute;right:-6.5px;top:14px;width:13px;height:13px;border-radius:50%;background:var(--paper);border:2px solid var(--ink)}
.group{margin-left:var(--s5);background:var(--surface);border-radius:var(--r-lg);overflow:hidden;min-width:0}
.group.focus{background:var(--ink);color:#fff;border-left:4px solid var(--gold)}
.tab{display:flex;justify-content:space-between;align-items:center;height:32px;padding:0 var(--s4);background:var(--ink);color:#fff;font-weight:700;font-size:var(--fs-meta)}
.group.focus .tab{border-bottom:1px solid rgba(255,255,255,.14)}
.rows>li+li{border-top:1px solid var(--line)}
.group.focus .rows>li+li{border-top-color:rgba(255,255,255,.14)}
.group.focus .bid,.group.focus .row-sub,.group.focus .party,.group.focus .hint,.group.focus .money{color:rgba(255,255,255,.68)}
.group.focus .flag.late{color:#E8B84B}
.group.focus .flag.wash{color:#5FD4C8}
.group.focus .chips li{border-color:rgba(255,255,255,.3);color:#fff}
.group.focus .chips li.short{border-color:#5FD4C8;color:#5FD4C8}
.group.focus .link,.group.focus .iconlink{color:#fff;border-color:rgba(255,255,255,.3)}
.group.focus .iconlink:hover{background:rgba(255,255,255,.12)}
.group.focus .link{text-decoration-color:rgba(255,255,255,.4)}
.group.focus .chev{color:rgba(255,255,255,.6)}
.now{display:grid;grid-template-columns:var(--rail) minmax(0,1fr);align-items:center;margin-bottom:var(--s5);position:relative;z-index:1}
.now-t{justify-self:end;margin-right:6px;background:var(--gold);color:var(--ink);font-weight:800;font-size:var(--fs-meta);padding:4px 9px;border-radius:6px;white-space:nowrap}
.now i{display:block;height:2px;background:var(--gold)}
.done{margin:0 0 var(--s5) calc(var(--rail) + var(--s5))}
.done-toggle{display:inline-flex;align-items:center;gap:var(--s2);height:44px;font-weight:600;font-size:var(--fs-body);color:var(--ink-2)}
.done-list li{display:grid;grid-template-columns:76px minmax(0,1fr);gap:var(--s3);padding:10px 0;border-top:1px solid var(--line);font-size:var(--fs-body);color:var(--ink-2)}
.done-list b{color:var(--ink);font-weight:600}
.done-list .by{display:block;font-size:var(--fs-meta)}
.done-list span.t{font-variant-numeric:tabular-nums}

/* ── Event row ──────────────────────────────────────────────────────── */
.row{--c:var(--pickup)}
.row.return{--c:var(--return)}
.row.wash{--c:var(--wash)}
.row-line{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--s4);align-items:center;padding:var(--s3) var(--s4)}
.row-hit{display:flex;align-items:center;gap:14px;text-align:left;min-width:0;padding:4px 0;border-radius:10px;width:100%}
.glyph{--c:var(--pickup);width:44px;height:44px;border-radius:var(--r-md);flex:none;display:grid;place-items:center;background:var(--c);color:#fff}
.glyph.return{--c:var(--return);background:transparent;color:var(--c);box-shadow:inset 0 0 0 2.5px var(--c)}
.glyph.wash{--c:var(--wash);border-radius:50%}
.row-text{display:grid;gap:2px;min-width:0;flex:1}
.row-name{display:flex;align-items:baseline;gap:var(--s2);flex-wrap:wrap}
.row-name b{font-size:var(--fs-title);font-weight:700;letter-spacing:-.005em;line-height:1.25}
.bid{color:var(--ink-2);font-size:var(--fs-meta);font-weight:500}
.flag{display:inline-flex;align-items:center;gap:4px;font-size:var(--fs-meta);font-weight:700;align-self:center}
.flag.late{color:var(--amber)}
.flag.wash{color:var(--wash)}
.row-sub{font-size:var(--fs-body);color:var(--ink-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kind{font-weight:700;color:var(--c);margin-right:var(--s2)}
.chev{color:var(--ink-3);transition:transform .15s}
.is-open .chev{transform:rotate(180deg)}
.row-more{padding:0 var(--s4) var(--s4) calc(var(--s4) + 44px + 14px)}
.party{font-size:var(--fs-body);color:var(--ink-2);margin-bottom:var(--s2)}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chips li{background:var(--sand);border-radius:var(--r-sm);padding:4px 10px;font-size:var(--fs-body)}
.chips li b{font-weight:700}
.chips li.short{border:1.5px dashed var(--wash);color:var(--wash)}
.more-actions{display:flex;gap:var(--s5);margin-top:var(--s3);flex-wrap:wrap}
.link{display:inline-flex;align-items:center;gap:6px;min-height:36px;font-weight:600;font-size:var(--fs-body);text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line-2)}
.act{--c:var(--pickup);height:44px;min-width:124px;padding:0 var(--s4);border-radius:var(--r-md);border:2px solid var(--c);color:var(--c);background:transparent;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:var(--s2);white-space:nowrap}
.act.return{--c:var(--return)}
.act.wash{--c:var(--wash)}
.act.dark{--c:var(--ink)}
.act.solid{background:var(--c);color:#fff}
.act.locked{border:2px dashed var(--ink-3);color:var(--ink-2);background:transparent}
.act:disabled{opacity:.4}
.act:active{transform:translateY(1px)}
.marker{display:flex;align-items:center;gap:var(--s3);padding:var(--s3) var(--s4);background:var(--sand);min-height:56px}
.marker .glyph{width:28px;height:28px;border-radius:50%}
.marker p{flex:1;font-size:var(--fs-body);color:var(--ink-2)}
.marker p b{color:var(--ink);font-weight:700}

/* ── Aside: laundry, desk ───────────────────────────────────────────── */
.side{display:grid;gap:var(--s7)}
.side h2{display:flex;align-items:center;gap:10px;font:700 var(--fs-h2)/1.2 var(--sans);letter-spacing:-.005em;color:var(--ink);margin-bottom:var(--s3)}
.rule{display:flex;gap:6px;margin-top:var(--s3);font-size:var(--fs-meta);color:var(--ink-2);line-height:1.4}
.pipe{margin-top:var(--s5)}
.stage{display:grid;grid-template-columns:24px minmax(0,1fr);column-gap:var(--s3);position:relative;padding-bottom:var(--s5)}
.stage:last-child{padding-bottom:0}
.stage::before{content:'';position:absolute;left:11px;top:28px;bottom:4px;border-left:1.5px dashed var(--line-2)}
.stage:last-child::before{display:none}
.stage-n{width:24px;height:24px;border-radius:50%;background:var(--ink);color:#fff;font:700 12px var(--sans);display:grid;place-items:center}
.stage h3{font-size:var(--fs-body);font-weight:700;line-height:24px}
.stage .empty{font-size:var(--fs-body);color:var(--ink-2);margin-top:var(--s1)}
.plain{margin-top:var(--s2);display:grid;gap:6px}
.plain li{font-size:var(--fs-body);display:flex;flex-wrap:wrap;column-gap:var(--s2)}
.plain li span{color:var(--ink-2);font-size:var(--fs-meta)}
.stage .act{width:100%;margin-top:var(--s3)}
.batch{margin-top:var(--s3);padding-top:var(--s3);border-top:1px solid var(--line)}
.batch:first-of-type{border-top:0;padding-top:0}
.batch.late{border-left:3px solid var(--amber);padding-left:var(--s3);border-top:0}
.batch-h{display:flex;justify-content:space-between;align-items:baseline;gap:var(--s2);flex-wrap:wrap}
.batch-h b{font-size:var(--fs-body)}
.batch-h span{font-size:var(--fs-meta);font-weight:700;color:var(--wash)}
.batch.late .batch-h span{color:var(--amber)}
.batch p{font-size:var(--fs-body);color:var(--ink-2);margin-top:2px}
.need{display:flex;gap:6px;align-items:flex-start;margin-top:var(--s2);font-size:var(--fs-meta);font-weight:700;color:var(--amber)}
.rack li{display:flex;align-items:center;gap:var(--s2);font-size:var(--fs-body);color:var(--ink-2);padding:2px 0}
.rack li b{color:var(--ink);font-weight:600}
.rack svg{color:var(--wash)}
.desk li{padding:var(--s3) 0;border-top:1px solid var(--line);display:grid;grid-template-columns:1fr auto;gap:2px var(--s3);align-items:center}
.desk li:first-child{margin-top:var(--s3)}
.desk li small{grid-column:1;font-size:var(--fs-meta);color:var(--ink-2)}
.desk li b{font-size:var(--fs-body)}
.desk .act{min-width:0;height:40px;grid-row:1 / span 2;grid-column:2}
.desk .empty{margin-top:var(--s3);font-size:var(--fs-body);color:var(--ink-2)}

/* ── States ─────────────────────────────────────────────────────────── */
.state{padding:var(--s2) 0}
.tl .state{margin-left:calc(var(--rail) + var(--s5))}
.state h2{font:700 var(--fs-h2)/1.2 var(--sans);letter-spacing:-.005em;display:flex;gap:10px;align-items:center}
.state p{margin-top:var(--s2);color:var(--ink-2);max-width:50ch}
.state .btns{display:flex;gap:var(--s3);margin-top:var(--s4);flex-wrap:wrap}
.state .code{margin-top:var(--s4);font-size:var(--fs-meta);color:var(--ink-2)}
.state.err{border-left:4px solid var(--ink);padding-left:var(--s4)}
.skel{display:grid;gap:var(--s3)}
.skel i{display:block;height:76px;border-radius:var(--r-lg);background:linear-gradient(90deg,var(--sand),#F7F2E6,var(--sand));background-size:200% 100%;animation:sh 1.2s linear infinite}
@keyframes sh{to{background-position:-200% 0}}

/* ── Sheets & toast ─────────────────────────────────────────────────── */
.scrim{position:fixed;inset:0;z-index:50;background:rgba(31,27,23,.48);display:flex}
.sheet{background:var(--surface);display:flex;flex-direction:column;max-height:92vh;box-shadow:0 30px 80px rgba(0,0,0,.3)}
.sheet.center{margin:auto;width:520px;border-radius:var(--r-lg)}
.sheet.bottom{margin-top:auto;width:100%;border-radius:20px 20px 0 0}
.sheet-h{display:flex;justify-content:space-between;gap:var(--s3);padding:var(--s5) var(--s5) var(--s2)}
.sheet-h h2{font:700 var(--fs-title)/1.2 var(--sans);letter-spacing:-.005em}
.sheet-h p{margin-top:var(--s1);font-size:var(--fs-body);color:var(--ink-2)}
.sheet-b{padding:var(--s2) var(--s5) var(--s4);overflow:auto;flex:1}
.sheet-f{display:flex;gap:var(--s3);padding:var(--s4) var(--s5) var(--s5);border-top:1px solid var(--line)}
.sheet-f .act{flex:1;height:48px}
.pick{display:grid;grid-template-columns:1fr auto;gap:var(--s2) var(--s3);align-items:center;padding:var(--s3) 0;border-top:1px solid var(--line)}
.pick:first-child{border-top:0}
.pick b{font-size:var(--fs-body)}
.pick small{display:block;font-size:var(--fs-meta);color:var(--ink-2);margin-top:2px}
.pick small.w{color:var(--wash);font-weight:700}
.cond{grid-column:1 / -1;display:flex;gap:6px;align-items:center;font-size:var(--fs-meta);color:var(--ink-2)}
.cond button{height:40px;padding:0 var(--s3);border-radius:var(--r-sm);border:1.5px solid var(--line-2);font-weight:600;font-size:var(--fs-body)}
.cond button[aria-pressed=true]{background:var(--ink);color:#fff;border-color:var(--ink)}
.cond button.bad[aria-pressed=true]{background:var(--red);border-color:var(--red)}
.step{display:inline-flex;align-items:center;border:1.5px solid var(--ink);border-radius:var(--r-md);overflow:hidden}
.step button{width:44px;height:44px;display:grid;place-items:center}
.step button:disabled{opacity:.3}
.step output{min-width:34px;text-align:center;font-weight:700;font-size:var(--fs-title);font-variant-numeric:tabular-nums}
.chk{display:grid;grid-template-columns:auto 1fr;gap:var(--s3);align-items:center;padding:var(--s3) 0;border-top:1px solid var(--line);text-align:left;width:100%}
.chk:first-child{border-top:0}
.box{width:26px;height:26px;border-radius:7px;border:2px solid var(--ink);display:grid;place-items:center;color:#fff}
.chk[aria-checked=true] .box{background:var(--wash);border-color:var(--wash)}
.chk small{display:block;font-size:var(--fs-meta);color:var(--ink-2)}
.note{display:flex;gap:var(--s2);align-items:flex-start;margin-top:var(--s3);font-size:var(--fs-body);color:var(--ink-2);background:var(--sand);padding:var(--s3);border-radius:var(--r-md)}
.note.warn{background:#FFEFC2;color:var(--amber)}
.tg{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--s2);margin-top:var(--s2)}
.tg button{height:52px;border-radius:var(--r-md);border:1.5px solid var(--line-2);font-weight:700;font-variant-numeric:tabular-nums;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.15;background:var(--surface)}
.tg button small{font-weight:600;font-size:11px;color:var(--ink-2)}
.tg button[aria-pressed=true]{background:var(--ink);color:#fff;border-color:var(--ink)}
.tg button[aria-pressed=true] small{color:#E6DCC6}
.tg button.cur{border-style:dashed;border-color:var(--ink)}
.inp{width:100%;height:52px;border:1.5px solid var(--ink);border-radius:var(--r-md);padding:0 var(--s4);font:inherit;font-size:16px;background:#fff;color:var(--ink)}
.res button{display:flex;justify-content:space-between;gap:var(--s3);width:100%;padding:var(--s3) 0;border-top:1px solid var(--line);text-align:left;min-height:52px;align-items:center}
.res span{color:var(--ink-2);font-size:var(--fs-body)}
.res .none{padding:var(--s4) 0;color:var(--ink-2)}
.x{width:44px;height:44px;border-radius:var(--r-md);display:grid;place-items:center;flex:none;color:var(--ink-2)}
.x:hover{background:var(--sand)}
.toast{position:fixed;z-index:60;left:50%;transform:translateX(-50%);bottom:var(--s5);width:max-content;max-width:calc(100vw - 32px);background:var(--ink);color:#fff;border-radius:var(--r-md);padding:var(--s3) var(--s2) var(--s3) var(--s4);display:flex;align-items:center;gap:var(--s3);box-shadow:0 14px 36px rgba(0,0,0,.3);font-weight:500}
.toast.offline{background:var(--surface);color:var(--ink);border:2px solid var(--ink);align-items:flex-start;padding-right:var(--s4)}
.toast.offline b{display:block;font-size:var(--fs-body)}
.toast.offline span{font-size:var(--fs-body);color:var(--ink-2)}
.toast>button{color:var(--gold);font-weight:800;padding:var(--s2) var(--s3);border-radius:var(--r-sm);min-height:44px}

/* ── Mobile composition ─────────────────────────────────────────────── */
.mobile{--rail:68px;--fs-display:26px;--fs-time:19px;--fs-title:17px;--fs-body:16px}
.m-top{position:sticky;top:0;z-index:20;background:var(--surface);border-bottom:1px solid var(--line);padding:var(--s3) var(--s2) var(--s3) var(--s4);display:flex;align-items:center;justify-content:space-between;gap:var(--s2);min-height:68px}
.m-top h1{font:700 var(--fs-display)/1.15 var(--serif);letter-spacing:-.02em;margin-top:6px}
.m-tools{display:flex;align-items:center}
.mobile .iconbtn{width:44px;height:44px}
.mobile .banner{padding:var(--s3) var(--s4)}
.mobile .od-clear{padding:var(--s3) var(--s4) 0}
.mobile .od-in{padding:var(--s3) var(--s4) var(--s1)}
.mobile .dsk,.mobile .od-btn.ext,.mobile .od-btn .lbl{display:none}
.mobile .od-btn.solid .lbl{display:inline}
.mobile .od-head{font-size:var(--fs-title)}
.mobile .od-mini-row{padding:0 var(--s4)}
.mobile .od-collapse{width:40px;height:40px}
.mobile .od-row{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"late btns" "who btns";gap:2px var(--s3);align-items:center;padding:var(--s3) 0}
.mobile .od-late{grid-area:late;font-size:var(--fs-body)}
.mobile .od-who{grid-area:who}
.mobile .od-btns{grid-area:btns;grid-row:1 / span 2}
.mobile .od-btn.call{width:44px;padding:0}
.mobile .page{display:block;padding:var(--s4) var(--s4) 120px}
.segm{display:grid;grid-template-columns:1fr 1fr;background:var(--sand);border-radius:var(--r-md);padding:3px;margin-bottom:var(--s5)}
.segm button{height:44px;border-radius:9px;font-weight:700;display:flex;gap:var(--s2);align-items:center;justify-content:center;color:var(--ink-2)}
.segm button[aria-selected=true]{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.14)}
.cnt{background:var(--ink);color:#fff;border-radius:99px;font-size:12px;min-width:20px;height:20px;display:grid;place-items:center;padding:0 6px}
.mobile .time{padding-right:16px;padding-top:14px}
.mobile .time::after{top:16px}
.mobile .time small{font-size:10px}
.mobile .group{margin-left:var(--s3)}
.mobile .done{margin-left:calc(var(--rail) + var(--s4))}
.mobile .now-t{font-size:12px;padding:3px 8px}
.mobile .row-line{grid-template-columns:minmax(0,1fr);padding:var(--s3)}
.mobile .glyph{width:40px;height:40px}
.mobile .row-more{padding:0 var(--s3) var(--s4)}
.mobile .row-more .act{width:100%;height:48px;margin-top:var(--s4)}
.mobile .row-sub{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.mobile .marker{padding:var(--s3)}
.mobile .tl .state{margin-left:calc(var(--rail) + var(--s3))}
.mobile .side{gap:var(--s6)}
.bar{position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--surface);border-top:1px solid var(--line);display:grid;grid-template-columns:1fr 1fr 84px 1fr 1fr;align-items:center;padding:6px 0 calc(6px + env(safe-area-inset-bottom,0px))}
.bar button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;height:52px;font-size:12px;font-weight:600;color:var(--ink-2)}
.bar button.on{color:var(--ink)}
.bar .plus{width:56px;height:56px;border-radius:50%;background:var(--ink);color:#fff;margin:0 auto;box-shadow:0 6px 16px rgba(31,27,23,.3)}
.bar .plus.locked{background:var(--surface);color:var(--ink);border:2px dashed var(--ink-3);box-shadow:none}
.mobile .toast{bottom:88px}

@media (max-width:1080px){.page{grid-template-columns:minmax(0,1fr) 260px;gap:32px}.nav{display:none}}
@media (prefers-reduced-motion:reduce){.wh *{animation:none!important;transition:none!important}}

/* ── v5.1: money line, alterations, WhatsApp, payment summary, damage note ── */
.money{margin-top:var(--s3);font-size:var(--fs-body);font-weight:600;color:var(--ink)}
.chip-alt{display:inline-flex;align-items:center;gap:4px;align-self:center;height:22px;padding:0 8px;border-radius:99px;background:#FFEFC2;color:var(--amber);font-size:var(--fs-meta);font-weight:700;white-space:nowrap}
.hint{margin-top:var(--s3);font-size:var(--fs-body);color:var(--ink-2)}
.hint .link{display:inline-flex;min-height:0}
.iconlink{width:36px;height:36px;border-radius:var(--r-sm);border:1.5px solid var(--line-2);display:grid;place-items:center;color:var(--ink);text-decoration:none}
.iconlink:hover{background:var(--sand)}
.more-actions{align-items:center}
.sum{padding:var(--s3) var(--s5) var(--s3);border-top:1px solid var(--line);background:var(--paper)}
.rows-sum{display:grid;gap:6px}
.rows-sum .r{display:flex;justify-content:space-between;gap:var(--s3);font-size:var(--fs-body);color:var(--ink-2)}
.rows-sum .r b{font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums;text-align:right}
.rows-sum .r.total{margin-top:2px;padding-top:var(--s2);border-top:1.5px solid var(--ink);color:var(--ink);font-weight:700;font-size:var(--fs-body)}
.rows-sum .r.total b{font-weight:800;font-size:var(--fs-title)}
.sum-note{margin-top:var(--s2);font-size:var(--fs-meta);color:var(--amber);font-weight:600}
.pay{display:flex;align-items:center;gap:var(--s2);margin-top:var(--s3)}
.pay span{font-size:var(--fs-body);font-weight:600;margin-right:auto}
.pay button{height:44px;min-width:76px;padding:0 var(--s4);border-radius:var(--r-md);border:1.5px solid var(--line-2);background:var(--surface);font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.pay button[aria-checked=true]{background:var(--ink);color:#fff;border-color:var(--ink)}
.pay em{font-style:normal;font-size:var(--fs-meta);font-weight:700;color:var(--amber)}
.depchk{display:flex;align-items:center;gap:var(--s2);margin-top:var(--s3);font-size:var(--fs-body);font-weight:600}
.depchk input{width:20px;height:20px;accent-color:var(--ink)}
.sum .inp.sm{margin-top:var(--s2)}
.dmg{grid-column:1 / -1}
.inp.sm{height:46px;font-size:16px}
.req{display:block;margin-top:4px;font-size:var(--fs-meta);font-weight:600;color:var(--red)}
.pill.alert{cursor:pointer;min-height:36px;text-decoration:none}
.pill.alert:hover{background:var(--red-d)}
.pill.alert .show{font-weight:600;text-decoration:underline;text-underline-offset:3px}
.od-more{display:flex;align-items:center;gap:6px;width:100%;min-height:44px}
.mobile .pill.alert .show{display:none}
.mobile .iconlink{width:44px;height:44px}
.mobile .sum{padding:var(--s3) var(--s4)}
.m-top h1{white-space:nowrap;font-size:24px}
.m-tools{gap:0}
.m-tools .iconbtn{width:40px}
.m-tools .pill{margin-right:var(--s1);padding:0 10px}
`;

/* ───────────── icons ───────────── */
const ICONS = { House, CalendarDays, Shirt, UsersRound, Menu, Plus, Search, WifiOff, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownLeft, Droplet, Check, TriangleAlert, Phone, Clock, X, Lock, Minus, Info, RotateCw, ShieldCheck,
  Hourglass, CalendarClock, Flag, Settings, ChartNoAxesCombined, MessageCircle, Scissors };

function Icon({ n, size = 18, sw = 2 }) {
  const node = ICONS[n];
  if (!node) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {node.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}

/* ───────────── helpers ───────────── */
const cx = (...a) => a.filter(Boolean).join(' ');
const pad = (n) => String(n).padStart(2, '0');
const clock = (m) => ({ t: `${Math.floor(m / 60) % 12 || 12}:${pad(m % 60)}`, ap: m >= 720 ? 'PM' : 'AM' });
const clockStr = (m) => { const c = clock(m); return `${c.t} ${c.ap}`; };
const inMin = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`);
const pieces = (lines) => lines.reduce((s, l) => s + l.qty, 0);
const lineText = (lines) => lines.map((l) => `${l.name} ×${l.qty}`).join(', ');
const first = (name) => name.split(' ')[0];
const plur = (n, a, b) => (n === 1 ? a : b);
const uid = () => Math.random().toString(36).slice(2, 8);
const telHref = (p) => `tel:${p.replace(/\s/g, '')}`;
/* wa.me needs the country code; bare 10-digit Indian numbers get +91. No pre-filled text. */
const waHref = (p) => { const d = p.replace(/\D/g, ''); return `https://wa.me/${d.length === 10 ? `91${d}` : d}`; };

/* Money is stored as integer paise and only ever shown per booking, when it implies an action.
   Indian digit grouping: 1,00,000. */
const R = (rupees) => Math.round(rupees * 100);
const inr = (paise) => {
  const neg = paise < 0;
  const r = Math.abs(paise) / 100;
  const [i, d] = r.toFixed(2).split('.');
  const grouped = i.length > 3 ? `${i.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${i.slice(-3)}` : i;
  return `${neg ? '−' : ''}₹${grouped}${d === '00' ? '' : `.${d}`}`;
};

const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayDate = (o) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + o); return d; };
const longDay = (o) => { const d = dayDate(o); return `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`; };
const shortDay = (o) => { const d = dayDate(o); return `${WD[d.getDay()].slice(0, 3)} ${d.getDate()} ${MO[d.getMonth()].slice(0, 3)}`; };
const relDay = (o) => (o === 0 ? 'Today' : o === 1 ? 'Tomorrow' : o === -1 ? 'Yesterday' : o > 0 ? `In ${o} days` : `${-o} days ago`);

const TYPE = {
  pickup: { label: 'Pickup', verb: 'Hand over', icon: 'ArrowUpRight' },
  return: { label: 'Return', verb: 'Take back', icon: 'ArrowDownLeft' },
  wash: { label: 'Wash back', verb: 'Mark washed', icon: 'Droplet' },
};
const ORDER = { pickup: 0, return: 1, wash: 2 };
const ROLE = {
  staff: { name: 'Anu', title: 'Staff', ini: 'AN' },
  manager: { name: 'Reshma', title: 'Manager', ini: 'RE' },
  owner: { name: 'Jacob', title: 'Owner', ini: 'JA' },
};

/* ───────────── sample data (replace with Firestore reads) ─────────────
   Times are minutes since midnight. `onRack` on a line = how many of that
   line are physically available; missing = all of them. */
const L = (id, name, qty, onRack) => (onRack === undefined ? { id, name, qty } : { id, name, qty, onRack });

function seed(scn) {
  const base = [
    { id: 'y1', day: -1, type: 'pickup', time: 600, name: 'Sebin Jose', phone: '98470 55102', bid: 1036, lines: [L('a', 'Sherwani · Cream', 1)], status: 'done', doneAt: 604, by: 'Anu' },
    { id: 'y2', day: -1, type: 'return', time: 690, name: 'Basil Thomas', phone: '94470 21877', bid: 1031, lines: [L('a', 'Suit · Navy', 2)], status: 'done', doneAt: 700, by: 'Reshma' },
    { id: 'e1', day: 0, type: 'return', time: 570, name: 'Sameer Kutty', phone: '98950 44120', bid: 1053, lines: [L('a', 'Sherwani · Ivory', 1)], status: 'done', doneAt: 581, by: 'Anu' },
    { id: 'e2', day: 0, type: 'pickup', time: 600, name: 'Mohammed Ashraf', phone: '99610 30877', bid: 1048, lines: [L('a', 'Jodhpuri · Navy', 1), L('b', 'Stole · Gold', 1)], status: 'done', doneAt: 604, by: 'Anu' },
    { id: 'e3', day: 0, type: 'pickup', time: 630, name: 'Anand Pillai', phone: '98460 71230', bid: 1055, lines: [L('a', 'Suit · Charcoal', 1)], status: 'pending' },
    { id: 'e4', day: 0, type: 'pickup', time: 690, name: 'Faisal Rahman', phone: '98470 90311', bid: 1051, party: 'Groom + 1 groomsman', lines: [L('a', 'Sherwani · Maroon', 2), L('b', 'Trouser · Cream', 2, 1), L('c', 'Stole · Gold', 1)], status: 'pending' },
    { id: 'e5', day: 0, type: 'return', time: 690, name: 'Rahul Menon', phone: '94960 11842', bid: 1041, lines: [L('a', 'Sherwani · Royal Blue', 1)], status: 'pending' },
    { id: 'e6', day: 0, type: 'pickup', time: 690, name: 'Vishnu Sankar', phone: '98950 66021', bid: 1057, party: 'Groom + 2 groomsmen', lines: [L('a', 'Suit · Charcoal', 3), L('b', 'Waistcoat · Silver', 3)], status: 'pending' },
    { id: 'e7', day: 0, type: 'pickup', time: 840, name: 'Nikhil Raj', phone: '97460 22811', bid: 1060, lines: [L('a', 'Sherwani · Ivory', 2)], status: 'pending' },
    { id: 'e8', day: 0, type: 'return', time: 840, name: 'Arjun Varma', phone: '98470 12099', bid: 1049, lines: [L('a', 'Indo-western · Sage', 1)], status: 'pending' },
    { id: 'e9', day: 0, type: 'pickup', time: 1050, name: 'Sajan Thomas', phone: '99460 87341', bid: 1062, lines: [L('a', 'Suit · Navy', 1), L('b', 'Waistcoat · Silver', 1)], status: 'pending' },
    { id: 'e10', day: 0, type: 'return', time: 1095, name: 'Ajmal Basheer', phone: '98950 10093', bid: 1044, lines: [L('a', 'Sherwani · Cream', 1)], status: 'pending' },
    { id: 't1', day: 1, type: 'pickup', time: 570, name: 'Thomas Chacko', phone: '94470 33012', bid: 1063, lines: [L('a', 'Suit · Navy', 1)], status: 'pending' },
    { id: 't2', day: 1, type: 'pickup', time: 630, name: 'Jibin Paul', phone: '98460 45102', bid: 1064, party: 'Groom + 1 groomsman', lines: [L('a', 'Sherwani · Maroon', 2), L('b', 'Stole · Gold', 2)], status: 'pending' },
    { id: 't3', day: 1, type: 'return', time: 750, name: 'Jerin Mathew', phone: '99610 77120', bid: 1046, lines: [L('a', 'Jodhpuri · Navy', 1)], status: 'pending' },
    { id: 't4', day: 1, type: 'pickup', time: 960, name: 'Ranjith Kumar', phone: '97460 98120', bid: 1065, lines: [L('a', 'Indo-western · Sage', 1)], status: 'pending' },
  ];
  /* Per-booking money + flags. Advance-first: balanceDue = rental − advance. A caution deposit is
     optional and separate — it's agreed at booking (a few pickups here) or offered live in the sheet;
     it never folds into balanceDue. */
  const M = (rental, advance) => ({ rentalTotal: R(rental), advancePaid: R(advance), balanceDue: Math.max(0, R(rental - advance)) });
  const MONEY = {
    e3: M(3500, 1500), e4: M(8000, 2000), e6: M(14000, 5000), e7: M(6000, 2000), e9: M(4500, 4500),
    t1: M(3500, 1500), t2: M(9000, 4000), t4: M(5000, 3000),
  };
  /* Only one or two pickups arrive with a deposit already agreed; most returns carry none. */
  const DEPOSIT = { e4: 5000, t2: 5000, e5: 5000 };
  const EXTRA = { e7: { alterationsReady: false }, e8: { damageFlag: true } };
  const events = base.map((e) => ({
    ...e, ...(MONEY[e.id] || {}), ...(DEPOSIT[e.id] ? { depositHeld: R(DEPOSIT[e.id]) } : {}), ...(EXTRA[e.id] || {}),
  }));
  const busy = {
    events,
    overdue: [
      { id: 'o1', name: 'Niyas Musthafa', phone: '98470 12345', bid: 1039, daysLate: 2, depositHeld: R(5000), lines: [L('a', 'Sherwani · Ivory', 1)], blocks: 'Nikhil Raj needs an Ivory sherwani at 2:00 PM today' },
      { id: 'o2', name: 'Arun Das', phone: '98950 77120', bid: 1040, daysLate: 1, depositHeld: R(10000), lines: [L('a', 'Suit · Navy', 2), L('b', 'Waistcoat · Silver', 2)], blocks: null },
    ],
    batches: [
      { id: '11', dueDay: -1, sentDay: -2, dueTime: 1020, needsId: 'e4', needs: 'Faisal Rahman needs Trouser · Cream ×1 today at 11:30 AM', lines: [L('a', 'Trouser · Cream', 1), L('b', 'Stole · Gold', 1)] },
      { id: '12', dueDay: 0, sentDay: -1, dueTime: 960, lines: [L('a', 'Sherwani · Maroon', 2), L('b', 'Waistcoat · Gold', 2), L('c', 'Jodhpuri · Navy', 1)] },
    ],
    pool: [{ id: 'p1', name: 'Sherwani · Ivory', qty: 1, from: 'Sameer Kutty', at: '9:41 AM', flag: false }],
    rack: [{ id: 'r1', name: 'Suit · Charcoal', qty: 2, at: '8:55 AM' }],
    defects: [{ id: 'd1', text: 'Sherwani · Cream ×1 — zip stuck', who: 'Sebin Jose #1036', by: 'Anu', when: 'yesterday' }],
    nextWash: 13,
  };
  if (scn === 'quiet') return { ...busy, events: events.filter((e) => e.day !== 0), overdue: [], batches: [], pool: [], rack: [], defects: [] };
  if (scn === 'nooverdue') return { ...busy, overdue: [] };
  return busy;
}

/* ───────────── hooks ───────────── */
const deviceMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
function useNow(cfgNow) {
  const [n, setN] = useState(deviceMinutes);
  useEffect(() => {
    if (typeof cfgNow === 'number') return undefined;
    const id = setInterval(() => setN(deviceMinutes()), 30000);
    return () => clearInterval(id);
  }, [cfgNow]);
  return typeof cfgNow === 'number' ? cfgNow : n;
}
function useOnline(cfg) {
  const [on, setOn] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    if (cfg !== 'auto') return undefined;
    const up = () => setOn(true), down = () => setOn(false);
    window.addEventListener('online', up); window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, [cfg]);
  return cfg === 'auto' ? on : cfg !== false;
}
function useMedia(q) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const f = () => setM(mq.matches);
    f(); mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, [q]);
  return m;
}

/* ───────────── small parts ───────────── */
function ActBtn({ type, locked, solid, onClick, label, disabled, title }) {
  const T = TYPE[type];
  return (
    <button className={cx('act', type, solid && 'solid', locked && 'locked')} onClick={onClick} disabled={disabled}
      title={title || (locked ? 'Paused right now' : undefined)}>
      <Icon n={locked ? 'Lock' : T.icon} size={18} sw={2.4} />{label || T.verb}
    </button>
  );
}
const shortOf = (ev) => (ev.type === 'pickup' ? ev.lines.filter((l) => l.onRack !== undefined && l.onRack < l.qty) : []);
const shortN = (ev) => shortOf(ev).reduce((s, l) => s + (l.qty - l.onRack), 0);
const altPending = (ev) => ev.type === 'pickup' && ev.alterationsReady === false;

/* The one money line a row may carry. Only when something is due or held — never a "₹0" line. */
function moneyLine(ev) {
  if (ev.type === 'pickup' && ev.balanceDue > 0) return `Balance to collect · ${inr(ev.balanceDue)}`;
  if (ev.type === 'return' && ev.depositHeld > 0) return `Deposit held · ${inr(ev.depositHeld)} — refund on return${ev.damageFlag ? ' (deductions may apply)' : ''}`;
  return null;
}

/* One event = one row. Identity: glyph shape (filled square / outlined square / circle),
   direction arrow, the word, and the button verb — never colour alone. */
function EventRow({ ev, focus, expanded, late, lateMin, locked, mobile, onToggle, onAct, onTime, onOpen, onAltReady }) {
  const T = TYPE[ev.type];
  const sN = shortN(ev);
  const alt = altPending(ev);
  const money = moneyLine(ev);
  const actBtn = (
    <ActBtn type={ev.type} locked={locked} solid={mobile || focus} onClick={() => onAct(ev)}
      disabled={alt && !locked} title={alt ? 'Alterations not ready yet' : undefined} />
  );
  return (
    <li className={cx('row', ev.type, expanded && 'is-open')}>
      <div className="row-line">
        <button className="row-hit" onClick={() => onToggle(ev.id)} aria-expanded={expanded}>
          <span className={cx('glyph', ev.type)}><Icon n={T.icon} size={mobile ? 22 : 24} sw={2.4} /></span>
          <span className="row-text">
            <span className="row-name">
              <b>{ev.name}</b><span className="bid">#{ev.bid}</span>
              {late && <span className="flag late"><Icon n="Clock" size={13} sw={2.6} />{inMin(lateMin)} late</span>}
              {sN > 0 && <span className="flag wash"><Icon n="Droplet" size={13} sw={2.6} />{sN} in wash</span>}
              {alt && <span className="chip-alt"><Icon n="Scissors" size={13} sw={2.4} />Alterations pending</span>}
            </span>
            <span className="row-sub"><span className="kind">{T.label}</span>{lineText(ev.lines)}</span>
          </span>
          {mobile && <span className="chev"><Icon n="ChevronDown" size={20} /></span>}
        </button>
        {!mobile && actBtn}
      </div>
      {expanded && (
        <div className="row-more">
          {ev.party && <p className="party">{ev.party}</p>}
          <ul className="chips">
            {ev.lines.map((l) => <li key={l.id} className={l.onRack !== undefined && l.onRack < l.qty ? 'short' : undefined}>{l.name} <b>×{l.qty}</b>{l.onRack !== undefined && l.onRack < l.qty && ` · ${l.onRack} on rack`}</li>)}
          </ul>
          {money && <p className="money">{money}</p>}
          <div className="more-actions">
            <a className="link" href={telHref(ev.phone)}><Icon n="Phone" size={15} />{ev.phone}</a>
            <a className="iconlink" href={waHref(ev.phone)} target="_blank" rel="noopener noreferrer"
              aria-label={`WhatsApp ${ev.name}`} title="Open WhatsApp"><Icon n="MessageCircle" size={18} /></a>
            <button className="link" onClick={() => onTime(ev)}><Icon n="CalendarClock" size={15} />Change time</button>
            <button className="link" onClick={() => onOpen(ev)}>Open booking</button>
          </div>
          {alt && (
            <p className="hint">
              Hand over is paused until alterations are ready.{' '}
              <button className="link" onClick={() => onAltReady(ev)}>Mark alterations ready</button>
            </p>
          )}
          {mobile && actBtn}
        </div>
      )}
    </li>
  );
}

/* Wash batches on the timeline are a quiet marker, not an appointment. The action lives in Laundry. */
function WashMarker({ ev, late, lateMin, onLaundry }) {
  return (
    <li className="marker">
      <span className="glyph wash"><Icon n="Droplet" size={15} sw={2.6} /></span>
      <p><b>{ev.name}</b> due back from the laundry · {pieces(ev.lines)} {plur(pieces(ev.lines), 'piece', 'pieces')}{late && <> · <b style={{ color: 'var(--amber)' }}>{inMin(lateMin)} past due</b></>}</p>
      <button className="link" onClick={onLaundry}>Laundry<Icon n="ChevronRight" size={14} /></button>
    </li>
  );
}

/* ───────────── sheets ───────────── */
function Sheet({ mobile, title, sub, onClose, children, summary, foot }) {
  useEffect(() => {
    const f = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [onClose]);
  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={cx('sheet', mobile ? 'bottom' : 'center')} role="dialog" aria-modal="true" aria-label={title}>
        <header className="sheet-h">
          <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
          <button className="x" onClick={onClose} aria-label="Close"><Icon n="X" size={20} /></button>
        </header>
        <div className="sheet-b">{children}</div>
        {summary && <div className="sum">{summary}</div>}
        {foot && <footer className="sheet-f">{foot}</footer>}
      </div>
    </div>
  );
}

function Stepper({ value, max, onChange }) {
  return (
    <div className="step" role="group">
      <button onClick={() => onChange(value - 1)} disabled={value <= 0} aria-label="One fewer"><Icon n="Minus" size={18} /></button>
      <output>{value}</output>
      <button onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="One more"><Icon n="Plus" size={18} /></button>
    </div>
  );
}

const SumRow = ({ label, value, total }) => <div className={cx('r', total && 'total')}><span>{label}</span><b>{value}</b></div>;

/* Product picker + per-booking payment summary.
   Pickup:  balance must be collected (UPI or Cash) before the hand-over can be confirmed.
   Return:  a receipt-style refund summary; flagged lines need a written note and hold the final refund for a manager. */
function LinesSheet({ kind, obj, mobile, onClose, onConfirm }) {
  const T = TYPE[kind];
  const cap = (l) => (kind === 'pickup' ? Math.min(l.qty, l.onRack === undefined ? l.qty : l.onRack) : l.qty);
  const [picks, setPicks] = useState(() => Object.fromEntries(obj.lines.map((l) => [l.id, cap(l)])));
  const [flags, setFlags] = useState({});   // lineId -> issue note; a key present means "Has an issue"
  const [paid, setPaid] = useState(null);   // 'UPI' | 'Cash'
  const [depositOn, setDepositOn] = useState(!!obj.depositHeld);        // pickup only: staff opts in to a security deposit
  const [depositAmt, setDepositAmt] = useState(obj.depositHeld ? String(obj.depositHeld / 100) : '');
  const total = obj.lines.reduce((s, l) => s + (picks[l.id] || 0), 0);
  const all = pieces(obj.lines);
  const flagged = obj.lines.filter((l) => (picks[l.id] || 0) > 0 && l.id in flags);
  const missingNote = flagged.some((l) => !flags[l.id].trim());
  const sN = kind === 'pickup' ? shortN(obj) : 0;

  const showMoney = kind === 'pickup' && obj.rentalTotal !== undefined;
  const needsPayment = showMoney && obj.balanceDue > 0;
  const depositRupees = depositOn ? Math.max(0, Number(depositAmt) || 0) : 0;
  const deposit = kind === 'return' ? obj.depositHeld || 0 : 0;
  const rentBal = kind === 'return' ? obj.rentalBalance || 0 : 0;
  const showRefund = kind === 'return' && deposit > 0;
  const review = flagged.length > 0 || !!obj.damageFlag;
  const partial = total < all;
  const net = deposit - rentBal;

  const ready = total > 0 && !missingNote && !(needsPayment && !paid);
  const label = total === 0 ? T.verb : total === all ? `${T.verb} all ${all}` : `${T.verb} ${total} of ${all}`;

  const summary = showMoney ? (
    <>
      <div className="rows-sum">
        <SumRow label="Rental total" value={inr(obj.rentalTotal)} />
        {obj.advancePaid > 0 && <SumRow label="Advance paid" value={`−${inr(obj.advancePaid)}`} />}
        <SumRow total label="Collect at pickup" value={inr(obj.balanceDue)} />
        {depositOn && depositRupees > 0 && <SumRow label="Caution deposit" value={inr(R(depositRupees))} />}
      </div>
      <label className="depchk">
        <input type="checkbox" checked={depositOn} onChange={(e) => setDepositOn(e.target.checked)} />
        Also take a security deposit
      </label>
      {depositOn && (
        <input className="inp sm" type="number" inputMode="numeric" min="0" placeholder="Deposit amount (₹)"
          value={depositAmt} onChange={(e) => setDepositAmt(e.target.value)} aria-label="Security deposit amount" />
      )}
      {needsPayment && (
        <div className="pay" role="radiogroup" aria-label="Payment collected via">
          <span>Collected via</span>
          {!paid && <em>Required</em>}
          {['UPI', 'Cash'].map((m) => (
            <button key={m} role="radio" aria-checked={paid === m} onClick={() => setPaid(m)}>
              {paid === m && <Icon n="Check" size={16} sw={3} />}{m}
            </button>
          ))}
        </div>
      )}
    </>
  ) : showRefund ? (
    <>
      <div className="rows-sum">
        <SumRow label="Deposit held" value={inr(deposit)} />
        <SumRow label="Rental balance" value={`−${inr(rentBal)}`} />
        <SumRow label="Damage deductions" value={review ? 'pending manager review' : '−₹0'} />
        <SumRow total label="Refund to customer" value={partial ? 'On hold' : inr(Math.max(0, net))} />
      </div>
      {partial && <p className="sum-note">The deposit is released once everything is back.</p>}
      {net < 0 && <p className="sum-note">Customer still owes {inr(-net)} after the deposit — collect it before they leave.</p>}
      {review && <p className="sum-note">Final refund subject to manager review.</p>}
    </>
  ) : null;

  return (
    <Sheet mobile={mobile} onClose={onClose}
      title={kind === 'pickup' ? `Hand over to ${first(obj.name)}` : `Take back from ${first(obj.name)}`}
      sub={`#${obj.bid} · ${kind === 'pickup' ? 'Set how many of each piece leaves the shop' : 'Set how many of each piece is in front of you'}`}
      summary={summary}
      foot={<>
        <button className="act dark" onClick={onClose}>Cancel</button>
        <button className={cx('act solid', kind)} disabled={!ready} onClick={() => onConfirm(picks, flags, paid, depositOn ? R(depositRupees) : 0)}>
          <Icon n={T.icon} size={18} sw={2.4} />{label}
        </button>
      </>}>
      <ul>
        {obj.lines.map((l) => {
          const short = kind === 'pickup' && l.onRack !== undefined && l.onRack < l.qty;
          const isFlagged = l.id in flags;
          return (
            <li key={l.id} className="pick">
              <div>
                <b>{l.name}</b>
                <small className={short ? 'w' : undefined}>{short ? `${l.onRack} of ${l.qty} on the rack — rest still in wash` : `${l.qty} booked`}</small>
              </div>
              <Stepper value={picks[l.id]} max={cap(l)} onChange={(v) => setPicks({ ...picks, [l.id]: Math.max(0, Math.min(cap(l), v)) })} />
              {kind === 'return' && picks[l.id] > 0 && (
                <>
                  <div className="cond" role="group" aria-label={`Condition of ${l.name}`}>
                    Condition
                    <button aria-pressed={!isFlagged} onClick={() => { const { [l.id]: _drop, ...rest } = flags; setFlags(rest); }}>Fine</button>
                    <button className="bad" aria-pressed={isFlagged} onClick={() => !isFlagged && setFlags({ ...flags, [l.id]: '' })}>Has an issue</button>
                  </div>
                  {isFlagged && (
                    <div className="dmg">
                      <input className="inp sm" autoFocus placeholder="What's the issue? e.g. burn mark on right cuff"
                        value={flags[l.id]} onChange={(e) => setFlags({ ...flags, [l.id]: e.target.value })}
                        aria-label={`Issue with ${l.name}`} aria-invalid={!flags[l.id].trim()} />
                      {!flags[l.id].trim() && <span className="req">Required to continue</span>}
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
      {sN > 0 && <div className="note warn"><Icon n="Droplet" size={16} />{sN} {plur(sN, 'piece is', 'pieces are')} still at the laundry. Hand over the rest now — the booking stays open for the remainder.</div>}
      {flagged.length > 0 && <div className="note warn"><Icon n="Flag" size={16} />{flagged.length} flagged. Nothing is deducted at the counter — a manager decides when they resolve it.</div>}
      {kind === 'return' && all > total && total > 0 && <div className="note"><Icon n="Info" size={16} />Anything not ticked stays with the customer — the booking becomes “partly returned”.</div>}
    </Sheet>
  );
}

function CheckSheet({ title, sub, items, verb, note, mobile, onClose, onConfirm }) {
  const [on, setOn] = useState(() => Object.fromEntries(items.map((i) => [i.id, true])));
  const n = items.filter((i) => on[i.id]).reduce((s, i) => s + i.qty, 0);
  return (
    <Sheet mobile={mobile} title={title} sub={sub} onClose={onClose}
      foot={<>
        <button className="act dark" onClick={onClose}>Cancel</button>
        <button className="act solid wash" disabled={n === 0} onClick={() => onConfirm(items.filter((i) => on[i.id]).map((i) => i.id))}>
          <Icon n="Check" size={18} sw={2.6} />{verb} {n}
        </button>
      </>}>
      <div role="group">
        {items.map((i) => (
          <button key={i.id} className="chk" role="checkbox" aria-checked={!!on[i.id]} onClick={() => setOn({ ...on, [i.id]: !on[i.id] })}>
            <span className="box">{on[i.id] && <Icon n="Check" size={16} sw={3} />}</span>
            <span><b>{i.name} ×{i.qty}</b>{i.sub && <small>{i.sub}</small>}</span>
          </button>
        ))}
      </div>
      {note && <div className="note"><Icon n="Lock" size={15} />{note}</div>}
    </Sheet>
  );
}

function TimeSheet({ ev, counts, dayLabel, mobile, onClose, onConfirm }) {
  const [to, setTo] = useState(ev.time);
  const slots = [];
  for (let t = 540; t <= 1140; t += 30) slots.push(t);
  return (
    <Sheet mobile={mobile} onClose={onClose} title={`Change time · ${first(ev.name)}`}
      sub={`${TYPE[ev.type].label} #${ev.bid} · ${dayLabel} · now ${clockStr(ev.time)}`}
      foot={<>
        <button className="act dark" onClick={onClose}>Cancel</button>
        <button className={cx('act solid', ev.type)} disabled={to === ev.time} onClick={() => onConfirm(to)}>
          {to === ev.time ? 'Pick a new time' : `Move to ${clockStr(to)}`}
        </button>
      </>}>
      <div className="tg" role="group" aria-label="Times">
        {slots.map((t) => (
          <button key={t} aria-pressed={to === t} className={t === ev.time ? 'cur' : undefined} onClick={() => setTo(t)}>
            {clockStr(t)}<small>{t === ev.time ? 'current' : counts[t] ? `${counts[t]} booked` : 'free'}</small>
          </button>
        ))}
      </div>
      <div className="note"><Icon n="Info" size={16} />Same day only — moving to another day changes stock reservations, so that happens inside the booking. The customer isn’t messaged automatically.</div>
    </Sheet>
  );
}

function SearchSheet({ data, mobile, onClose, onPick }) {
  const [q, setQ] = useState('');
  const all = {};
  data.events.filter((e) => e.day >= -1).forEach((e) => { all[e.bid] = { bid: e.bid, name: e.name, phone: e.phone, note: `${TYPE[e.type].label} · ${e.day === 0 ? 'today' : shortDay(e.day)} ${clockStr(e.time)}` }; });
  data.overdue.forEach((o) => { all[o.bid] = { bid: o.bid, name: o.name, phone: o.phone, note: `Overdue · ${o.daysLate}d late` }; });
  const list = Object.values(all).filter((b) => !q.trim() || `${b.name} ${b.bid} ${b.phone}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 7);
  return (
    <Sheet mobile={mobile} onClose={onClose} title="Find a booking" sub="Name, phone number or booking #">
      <input className="inp" autoFocus placeholder="e.g. Faisal, 98470 or 1051" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
      <div className="res">
        {list.length ? list.map((b) => <button key={b.bid} onClick={() => onPick(b)}><span style={{ color: 'var(--ink)', fontWeight: 700 }}>{b.name} <span>#{b.bid}</span></span><span>{b.note}</span></button>)
          : <p className="none">No match. Try the last 4 digits of the phone.</p>}
      </div>
    </Sheet>
  );
}

function NewSheet({ mobile, onClose, onGo }) {
  const [q, setQ] = useState('');
  return (
    <Sheet mobile={mobile} onClose={onClose} title="New booking" sub="Who is it for?"
      foot={<><button className="act dark" onClick={onClose}>Cancel</button><button className="act solid dark" disabled={!q.trim()} onClick={onGo}>Continue to dates</button></>}>
      <input className="inp" autoFocus placeholder="Customer name or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Customer name or phone" />
      <div className="note"><Icon n="Info" size={16} />This is where the booking wizard starts. The full flow is its own screen.</div>
    </Sheet>
  );
}

/* ═════════════════════════ the screen ═════════════════════════ */
export default function WedHubHome({ config }) {
  const cfg = { ...CONFIG, ...(config || {}) };
  const role = cfg.role;
  const me = ROLE[role];
  const online = useOnline(cfg.online);
  const offline = !online;
  const now = useNow(cfg.now);
  const mobile = useMedia('(max-width: 819px)');

  const [data, setData] = useState(() => seed(cfg.scenario));
  const dataRef = useRef(data);
  dataRef.current = data;
  const [errored, setErrored] = useState(cfg.scenario === 'error');
  const [loading, setLoading] = useState(false);
  const [dayOff, setDayOff] = useState(0);
  const [sheet, setSheet] = useState(null);
  const [toggled, setToggled] = useState(() => new Set());
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState('schedule');
  const [doneOpen, setDoneOpen] = useState(false);
  const [bandOut, setBandOut] = useState(false);
  const [odAll, setOdAll] = useState(false);
  const [odCollapsed, setOdCollapsed] = useState(() => {
    try { return sessionStorage.getItem('wh-od-collapsed') === '1'; } catch { return false; }
  });
  const bandRef = useRef(null);
  const laundryRef = useRef(null);
  const toastT = useRef(null);

  const isToday = dayOff === 0;
  const failed = errored && !loading;

  /* fonts (skip if your app already loads them) */
  useEffect(() => {
    if (document.getElementById('wh-fonts')) return;
    const l = document.createElement('link');
    l.id = 'wh-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400..800&family=Playfair+Display:wght@700&display=swap';
    document.head.appendChild(l);
  }, []);

  const notify = useCallback((t) => {
    clearTimeout(toastT.current);
    setToast(t);
    toastT.current = setTimeout(() => setToast(null), t.tone === 'offline' ? 5500 : 7000);
  }, []);
  const info = (msg) => notify({ tone: 'info', msg });
  const blocked = () => notify({ tone: 'offline' });

  /* every write goes through here: blocked offline, undoable for a few seconds */
  const run = (mutator, msg) => {
    if (offline) { blocked(); return false; }
    const prev = dataRef.current;
    const next = mutator(prev);
    dataRef.current = next;
    setData(next);
    notify({ tone: 'ok', msg, undo: () => { dataRef.current = prev; setData(prev); } });
    return true;
  };
  const retry = () => { setLoading(true); setTimeout(() => { setLoading(false); setErrored(false); setData(seed('busy')); }, 900); };

  /* derived */
  const dayEvs = [
    ...data.events.filter((e) => e.day === dayOff),
    ...data.batches.filter((b) => b.dueDay === dayOff && b.lines.length).map((b) => ({
      id: `w${b.id}`, day: dayOff, type: 'wash', time: b.dueTime, name: `Wash #${b.id}`, washId: b.id, lines: b.lines, status: 'pending',
    })),
  ].sort((a, b) => a.time - b.time || ORDER[a.type] - ORDER[b.type]);
  const pend = dayEvs.filter((e) => e.status === 'pending');
  const done = dayEvs.filter((e) => e.status === 'done');
  const appts = pend.filter((e) => e.type !== 'wash');
  const focus = isToday ? (appts.find((e) => e.time >= now) || appts[0]) : null;
  const laundryCount = (data.pool.length ? 1 : 0) + data.batches.filter((b) => b.dueDay <= 0).length;
  const overdueOn = isToday && !failed && !loading && data.overdue.length > 0;

  /* the top bar / header carries an overdue chip once the band scrolls away */
  useEffect(() => {
    const el = bandRef.current;
    if (!el) { setBandOut(false); return undefined; }
    const io = new IntersectionObserver(([en]) => setBandOut(!en.isIntersecting), { rootMargin: '-64px 0px 0px 0px', threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [overdueOn, mobile, data.overdue.length]);

  /* desktop shortcuts: N = new booking · / = find */
  useEffect(() => {
    if (mobile) return undefined;
    const f = (e) => {
      const tg = (e.target.tagName || '').toLowerCase();
      if (tg === 'input' || tg === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'n' || e.key === 'N') { if (!sheet) { e.preventDefault(); openNew(); } }
      else if (e.key === '/') { e.preventDefault(); setSheet({ kind: 'search' }); }
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  });

  /* ───── actions ───── */
  const openNew = () => { if (offline) return blocked(); setSheet({ kind: 'new' }); };
  const act = (ev) => {
    if (offline) return blocked();
    if (!isToday) return info(`“${TYPE[ev.type].verb}” unlocks on the day. You can still change the time.`);
    if (altPending(ev)) return info('Alterations not ready yet.');
    return setSheet({ kind: ev.type, src: 'event', id: ev.id });
  };
  const markAltReady = (ev) => run((d) => ({ ...d, events: d.events.map((e) => (e.id === ev.id ? { ...e, alterationsReady: true } : e)) }),
    `Alterations marked ready for ${first(ev.name)}`);
  const toggle = (id) => setToggled((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const shift = (d) => { setDayOff((o) => o + d); setDoneOpen(false); };
  const goLaundry = () => {
    if (mobile) { setTab('laundry'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (laundryRef.current) laundryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const scrollBand = () => bandRef.current && bandRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const toggleOdCollapsed = () => setOdCollapsed((v) => {
    const nv = !v;
    try { sessionStorage.setItem('wh-od-collapsed', nv ? '1' : '0'); } catch { /* no-op */ }
    return nv;
  });

  const doMove = (ev, to) => run((d) => ({ ...d, events: d.events.map((e) => (e.id === ev.id ? { ...e, time: to } : e)) }),
    `Moved ${first(ev.name)}’s ${TYPE[ev.type].label.toLowerCase()} to ${clockStr(to)}`);

  const applyPicks = (lines, picks) => lines.map((l) => {
    const n = picks[l.id] || 0;
    const nl = { ...l, qty: l.qty - n };
    if (l.onRack !== undefined) nl.onRack = Math.max(0, Math.min(nl.qty, l.onRack - n));
    return nl;
  }).filter((l) => l.qty > 0);

  /* Pickup: balance collected (UPI/Cash) clears balanceDue. Return: deposit is refunded only when everything is back
     and nothing is flagged; otherwise it stays held for a manager. Damage notes flow to "Needs a manager". */
  const confirmLines = (kind, src, obj, picks, flags, paid, depositCollected) => {
    const total = obj.lines.reduce((s, l) => s + (picks[l.id] || 0), 0);
    const flagged = obj.lines.filter((l) => (picks[l.id] || 0) > 0 && l.id in flags);
    const rest = applyPicks(obj.lines, picks);
    const collected = kind === 'pickup' && obj.balanceDue > 0 ? obj.balanceDue : 0;
    const deposit = kind === 'return' ? obj.depositHeld || 0 : 0;
    const review = flagged.length > 0 || !!obj.damageFlag;
    const refund = kind === 'return' && rest.length === 0 && !review ? Math.max(0, deposit - (obj.rentalBalance || 0)) : 0;
    let msg;
    if (kind === 'pickup') {
      const bits = [];
      if (collected) bits.push(`${inr(collected)} collected (${paid})`);
      if (depositCollected > 0) bits.push(`${inr(depositCollected)} security deposit taken`);
      msg = `Handed over to ${first(obj.name)} · ${total} ${plur(total, 'piece', 'pieces')}${bits.length ? ` · ${bits.join(' · ')}` : ''}`;
    } else {
      msg = `Took back ${total} ${plur(total, 'piece', 'pieces')} from ${first(obj.name)}`;
      if (flagged.length) msg += ` · ${flagged.length} flagged for a manager`;
      if (rest.length === 0 && deposit > 0) msg += review ? ' · refund pending manager review' : ` · refund ${inr(refund)}`;
    }
    return run((d) => {
      let { events, overdue, pool, defects } = d;
      const patch = (o) => ({
        ...o, lines: rest,
        ...(kind === 'pickup' && collected ? { balanceDue: 0, collectedVia: paid } : {}),
        ...(refund ? { depositHeld: 0, refunded: refund } : {}),
      });
      if (src === 'event') {
        events = d.events.map((e) => (e.id !== obj.id ? e : {
          ...patch(e), orig: e.orig || e.lines, doneAt: now, by: me.name, status: rest.length ? 'pending' : 'done',
        }));
      } else {
        overdue = rest.length ? d.overdue.map((o) => (o.id !== obj.id ? o : patch(o))) : d.overdue.filter((o) => o.id !== obj.id);
      }
      if (kind === 'return') {
        obj.lines.forEach((l) => {
          const n = picks[l.id] || 0;
          if (n <= 0) return;
          const note = l.id in flags ? flags[l.id].trim() : '';
          pool = [...pool, { id: uid(), name: l.name, qty: n, from: obj.name, at: clockStr(now), flag: l.id in flags }];
          if (l.id in flags) {
            defects = [...defects, { id: uid(), text: `${l.name} ×${n} — ${note}`, who: `${obj.name} #${obj.bid}`, by: me.name, when: 'just now', hold: deposit }];
          }
        });
      }
      return { ...d, events, overdue, pool, defects };
    }, msg);
  };

  const confirmSendWash = (ids) => {
    const picked = data.pool.filter((p) => ids.includes(p.id));
    const n = picked.reduce((s, p) => s + p.qty, 0);
    return run((d) => ({
      ...d,
      pool: d.pool.filter((p) => !ids.includes(p.id)),
      batches: [...d.batches, { id: String(d.nextWash), dueDay: 1, sentDay: 0, dueTime: 960, lines: picked.map((p) => ({ id: uid(), name: p.name, qty: p.qty })) }],
      nextWash: d.nextWash + 1,
    }), `Wash #${data.nextWash} created · ${n} ${plur(n, 'piece', 'pieces')} · due back tomorrow ~4:00 PM`);
  };

  /* marking washed is the ONLY way garments become available again */
  const confirmWashed = (batch, ids) => {
    const washed = batch.lines.filter((l) => ids.includes(l.id));
    const n = washed.reduce((s, l) => s + l.qty, 0);
    return run((d) => ({
      ...d,
      rack: [...washed.map((l) => ({ id: uid(), name: l.name, qty: l.qty, at: clockStr(now) })), ...d.rack],
      batches: batch.lines.length === washed.length ? d.batches.filter((b) => b.id !== batch.id)
        : d.batches.map((b) => (b.id === batch.id ? { ...b, lines: b.lines.filter((l) => !ids.includes(l.id)) } : b)),
      events: d.events.map((e) => {
        if (e.id !== batch.needsId) return e;
        return { ...e, lines: e.lines.map((l) => {
          const w = washed.find((x) => x.name === l.name);
          if (!w || l.onRack === undefined) return l;
          const on = Math.min(l.qty, l.onRack + w.qty);
          const { onRack, ...restL } = l;
          return on >= l.qty ? restL : { ...l, onRack: on };
        }) };
      }),
    }), `${n} ${plur(n, 'piece', 'pieces')} back on the rack`);
  };

  /* ───── parts ───── */
  const alertChip = () => (bandOut && overdueOn ? (
    <button className="pill alert" onClick={scrollBand} aria-label={`${data.overdue.length} overdue ${plur(data.overdue.length, 'return', 'returns')}. Scroll to them.`}>
      <Icon n="TriangleAlert" size={15} sw={2.6} />{data.overdue.length} overdue<span className="show"> · show</span>
    </button>
  ) : null);
  const offlineChip = () => (offline ? <span className="pill offline"><Icon n="WifiOff" size={15} />Offline</span> : null);
  const banner = () => offline && (
    <div className="banner" role="status">
      <Icon n="WifiOff" size={18} />
      <span><b>Offline.</b> Showing the schedule saved at {clockStr(now - 2)}. Hand over, take back, wash and time changes are paused until you reconnect.</span>
    </div>
  );

  const renderOverdue = () => {
    if (failed || loading || !isToday) return null;
    const list = data.overdue;
    if (!list.length) return <div className="od-clear"><Icon n="Check" size={16} sw={2.6} />Nothing overdue</div>;
    if (odCollapsed) {
      const bits = list.map((o) => `${first(o.name)} ${o.daysLate}d`).join(' · ');
      return (
        <section className="od od-mini" ref={bandRef} aria-label="Overdue returns, collapsed">
          <button className="od-mini-row" onClick={toggleOdCollapsed} aria-expanded={false}>
            <Icon n="TriangleAlert" size={18} sw={2.4} />
            <span>{list.length} overdue · {bits}</span>
            <Icon n="ChevronDown" size={18} sw={2.6} />
          </button>
        </section>
      );
    }
    const shown = odAll ? list : list.slice(0, 2);
    return (
      <section className="od" ref={bandRef} aria-label="Overdue returns">
        <div className="od-in">
          <div className="od-head">
            <Icon n="TriangleAlert" size={24} sw={2.4} />{list.length} overdue {plur(list.length, 'return', 'returns')}<span className="dsk"> — should already be back</span>
            <button className="od-collapse" onClick={toggleOdCollapsed} aria-label="Collapse overdue band" aria-expanded={true}>
              <Icon n="ChevronUp" size={20} sw={2.6} />
            </button>
          </div>
          {shown.map((o) => (
            <div className="od-row" key={o.id}>
              <div className="od-late">{o.daysLate} {plur(o.daysLate, 'day', 'days')} late</div>
              <div className="od-who">
                <b>{o.name}</b> <span>#{o.bid}</span>
                <div className="od-meta">{lineText(o.lines)}<span className="dsk"> · due {shortDay(-o.daysLate)}</span></div>
                {o.blocks && <div className="od-block"><Icon n="Hourglass" size={15} sw={2.4} />{o.blocks}</div>}
              </div>
              <div className="od-btns">
                <a className="od-btn call" href={telHref(o.phone)} aria-label={`Call ${o.name}`}><Icon n="Phone" size={17} /><span className="lbl">Call</span></a>
                {role !== 'staff' && (
                  <button className={cx('od-btn ext', offline && 'locked')} onClick={() => (offline ? blocked() : info('Extending a due date re-checks stock, so it opens inside the booking.'))}>
                    {offline && <Icon n="Lock" size={15} />}Extend
                  </button>
                )}
                <button className={cx('od-btn solid', offline && 'locked')} onClick={() => (offline ? blocked() : setSheet({ kind: 'return', src: 'overdue', id: o.id }))}>
                  <Icon n={offline ? 'Lock' : 'ArrowDownLeft'} size={17} sw={2.4} />Take back
                </button>
              </div>
            </div>
          ))}
          {list.length > 2 && (
            <button className="od-more" onClick={() => setOdAll((v) => !v)} aria-expanded={odAll}>
              {odAll ? 'Show fewer' : `+ ${list.length - shown.length} more overdue`}
              <Icon n={odAll ? 'ChevronUp' : 'ChevronDown'} size={16} sw={2.6} />
            </button>
          )}
        </div>
      </section>
    );
  };

  const renderDayHead = () => (
    <div className="dayhead">
      <div>
        <div className="overline">{relDay(dayOff)}</div>
        <h1>{longDay(dayOff)}</h1>
      </div>
      <div className="daynav">
        {!isToday && <button className="textbtn" onClick={() => setDayOff(0)}>Back to today</button>}
        <button className="iconbtn" onClick={() => shift(-1)} aria-label="Previous day"><Icon n="ChevronLeft" size={20} /></button>
        <button className="iconbtn" onClick={() => shift(1)} aria-label="Next day"><Icon n="ChevronRight" size={20} /></button>
      </div>
    </div>
  );

  const renderRow = (e) => {
    if (e.type === 'wash') {
      return <WashMarker key={e.id} ev={e} late={isToday && e.time < now} lateMin={now - e.time} onLaundry={goLaundry} />;
    }
    const isFocus = !!focus && focus.id === e.id;
    const expanded = isFocus ? !toggled.has(e.id) : toggled.has(e.id);
    return (
      <EventRow key={e.id} ev={e} focus={isFocus} expanded={expanded} late={isToday && e.time < now} lateMin={now - e.time}
        locked={offline || !isToday} mobile={mobile} onToggle={toggle} onAct={act}
        onTime={(x) => (offline ? blocked() : setSheet({ kind: 'time', id: x.id }))}
        onOpen={(x) => info(`Booking #${x.bid} opens on the Booking Detail screen.`)} onAltReady={(x) => (offline ? blocked() : markAltReady(x))} />
    );
  };

  const renderSlot = (t, evs) => {
    const c = clock(t);
    const hasFocus = !!focus && evs.some((e) => e.id === focus.id);
    const upcoming = focus && focus.time >= now;
    return (
      <section className="slot" key={`s${t}`} data-slot={t}>
        <div className="time">{c.t}<small>{c.ap}</small></div>
        <div className={cx('group', hasFocus && 'focus')}>
          {hasFocus && (
            <div className="tab">
              <span>{upcoming ? `Up next · in ${inMin(t - now)}` : 'Still waiting'}</span>
              {evs.length > 1 && <span>{evs.length} at this time</span>}
            </div>
          )}
          <ul className="rows">{evs.map(renderRow)}</ul>
        </div>
      </section>
    );
  };

  const renderDone = () => {
    const open = doneOpen || pend.length === 0;
    return (
      <div className="done">
        <button className="done-toggle" aria-expanded={open} onClick={() => setDoneOpen((o) => !o)}>
          <Icon n="Check" size={16} sw={2.6} />{done.length} done {isToday ? 'earlier' : ''}
          <Icon n={open ? 'ChevronDown' : 'ChevronRight'} size={16} />
        </button>
        {open && (
          <ul className="done-list">
            {done.map((e) => (
              <li key={e.id}>
                <span className="t">{clockStr(e.doneAt || e.time)}</span>
                <span><b>{e.name}</b> · {TYPE[e.type].label} · {lineText(e.orig || e.lines)}{role !== 'staff' && e.by && <span className="by">by {e.by}</span>}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderSchedule = () => {
    if (failed) {
      return (
        <div className="state err" role="alert">
          <h2><Icon n="TriangleAlert" size={24} sw={2.2} />{isToday ? 'Today’s schedule didn’t load' : 'This day didn’t load'}</h2>
          <p>Nothing you saved has been lost — the schedule just couldn’t be read. Overdue returns and laundry can’t be checked either, so don’t assume nothing is waiting.</p>
          <div className="btns">
            <button className="act dark solid" onClick={retry}><Icon n="RotateCw" size={17} />Try again</button>
            <button className="act dark" onClick={() => setSheet({ kind: 'search' })}><Icon n="Search" size={17} />Find a booking</button>
          </div>
          <div className="code">schedule read failed (unavailable) · {clockStr(now)} · tell the manager if it keeps happening</div>
        </div>
      );
    }
    if (loading) return <div className="skel" aria-busy="true" aria-label="Loading schedule"><i /><i /><i /></div>;
    if (!dayEvs.length) {
      const ds = [...new Set(data.events.filter((e) => e.day > dayOff && e.status === 'pending').map((e) => e.day))].sort((a, b) => a - b);
      const nxDay = ds[0];
      const nx = nxDay === undefined ? null : data.events.filter((e) => e.day === nxDay && e.status === 'pending').sort((a, b) => a.time - b.time);
      return (
        <div className="state">
          <h2>{isToday ? 'Nothing scheduled today' : `Nothing on ${shortDay(dayOff)}`}</h2>
          <p>
            {nx ? <>Next up is <b>{shortDay(nxDay)}</b> — {nx.length} {plur(nx.length, 'event', 'events')}, first at {clockStr(nx[0].time)}.</> : 'No pickups or returns are booked after this day yet.'}
            {isToday && ' Walk-ins are still welcome.'}
          </p>
          <div className="btns">
            <button className={cx('act solid dark', offline && 'locked')} onClick={openNew}><Icon n={offline ? 'Lock' : 'Plus'} size={17} />New booking</button>
            {nx && <button className="act dark" onClick={() => setDayOff(nxDay)}>Go to {shortDay(nxDay)}</button>}
            {role !== 'staff' && <button className="act dark" onClick={() => info('Calendar is its own screen — a later phase.')}>Open calendar</button>}
          </div>
        </div>
      );
    }
    const times = [...new Set(pend.map((e) => e.time))].sort((a, b) => a - b);
    const items = [];
    let nowPlaced = !isToday;
    times.forEach((t) => {
      if (!nowPlaced && t > now) { items.push({ k: 'now' }); nowPlaced = true; }
      items.push({ k: 'slot', t, evs: pend.filter((e) => e.time === t) });
    });
    if (!nowPlaced) items.push({ k: 'now' });
    return (
      <div className="tl">
        {done.length > 0 && renderDone()}
        {items.map((it) => (it.k === 'now'
          ? <div className="now" key="now"><span className="now-t">Now {clock(now).t}</span><i /></div>
          : renderSlot(it.t, it.evs)))}
        {isToday && pend.length === 0 && (
          <div className="state"><h2>All caught up</h2><p>Every pickup and return scheduled for today is done. Laundry may still need you.</p></div>
        )}
      </div>
    );
  };

  const dueLabel = (b) => (b.dueDay < 0 ? `Late · due ${shortDay(b.dueDay)}` : b.dueDay === 0 ? `Due today ~${clockStr(b.dueTime)}` : `Due tomorrow ~${clockStr(b.dueTime)}`);
  const renderLaundry = () => {
    if (failed) return <section ref={laundryRef}><h2>Laundry</h2><div className="note warn"><Icon n="Info" size={16} />Couldn’t load. Don’t assume nothing is waiting.</div></section>;
    if (loading) return <div className="skel"><i /></div>;
    const { pool, batches, rack } = data;
    return (
      <section ref={laundryRef} aria-label="Laundry">
        <h2><Icon n="Droplet" size={20} sw={2.4} />Laundry</h2>
        <p className="rule"><Icon n="Lock" size={14} />A garment can’t go back on the rack until you mark it washed.</p>
        <div className="pipe">
          <div className="stage">
            <span className="stage-n">1</span>
            <div>
              <h3>Returned, not in a wash yet</h3>
              {pool.length ? (
                <>
                  <ul className="plain">{pool.map((p) => <li key={p.id}><b>{p.name} ×{p.qty}</b><span>{p.flag && '⚑ '}{p.from} · {p.at}</span></li>)}</ul>
                  <button className={cx('act wash', offline && 'locked')} onClick={() => (offline ? blocked() : setSheet({ kind: 'sendWash' }))}>
                    <Icon n={offline ? 'Lock' : 'Droplet'} size={17} />Send to wash
                  </button>
                </>
              ) : <p className="empty">Everything returned is already in a wash.</p>}
            </div>
          </div>
          <div className="stage">
            <span className="stage-n">2</span>
            <div>
              <h3>At the laundry</h3>
              {batches.length ? batches.map((b) => {
                const late = b.dueDay < 0 || (b.dueDay === 0 && b.dueTime < now);
                return (
                  <div className={cx('batch', late && 'late')} key={b.id}>
                    <div className="batch-h"><b>Wash #{b.id}</b><span>{late && b.dueDay === 0 ? `Late · due ${clockStr(b.dueTime)}` : dueLabel(b)}</span></div>
                    <p>{lineText(b.lines)}</p>
                    {b.needs && <div className="need"><Icon n="Hourglass" size={14} sw={2.4} />{b.needs}</div>}
                    <button className={cx('act wash', offline && 'locked')} onClick={() => (offline ? blocked() : setSheet({ kind: 'markWashed', id: b.id }))}>
                      <Icon n={offline ? 'Lock' : 'Check'} size={17} sw={2.4} />Mark washed
                    </button>
                  </div>
                );
              }) : <p className="empty">Nothing at the laundry.</p>}
            </div>
          </div>
          <div className="stage">
            <span className="stage-n">3</span>
            <div>
              <h3>Back on the rack today</h3>
              {rack.length ? <ul className="rack plain">{rack.slice(0, 5).map((r) => <li key={r.id}><Icon n="Check" size={15} sw={3} /><b>{r.name} ×{r.qty}</b><span style={{ color: 'var(--ink-2)', fontSize: 13 }}>{r.at}</span></li>)}</ul>
                : <p className="empty">Nothing marked washed yet today.</p>}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderDesk = () => (
    <section className="desk" aria-label="Needs a manager">
      <h2><Icon n="ShieldCheck" size={20} sw={2.4} />Needs a manager</h2>
      {data.defects.length ? (
        <ul>
          {data.defects.map((d) => (
            <li key={d.id}>
              <b>{d.text}</b>
              <button className="act dark" onClick={() => info('Opens the flagged item on Item Detail.')}>Review</button>
              <small>{d.who} · flagged by {d.by}, {d.when}{d.hold > 0 && ` · ${inr(d.hold)} deposit on hold`}</small>
            </li>
          ))}
        </ul>
      ) : <p className="empty">No flagged garments.</p>}
    </section>
  );

  const toastEl = () => toast && (toast.tone === 'offline' ? (
    <div className="toast offline" role="status">
      <Icon n="WifiOff" size={22} />
      <div><b>You’re offline — nothing was changed</b><span>Hand over, take back, wash and time changes are paused until you reconnect.</span></div>
    </div>
  ) : (
    <div className="toast" role="status">
      <span>{toast.msg}</span>
      {toast.undo && <button onClick={() => { toast.undo(); notify({ tone: 'info', msg: 'Undone.' }); }}>Undo</button>}
    </div>
  ));

  const renderSheet = () => {
    if (!sheet) return null;
    const close = () => setSheet(null);
    const k = sheet.kind;
    if (k === 'pickup' || k === 'return') {
      const obj = sheet.src === 'overdue' ? data.overdue.find((o) => o.id === sheet.id) : data.events.find((e) => e.id === sheet.id);
      if (!obj) return null;
      return <LinesSheet key={sheet.id} kind={k} obj={obj} mobile={mobile} onClose={close}
        onConfirm={(picks, flags, paid, depositCollected) => { if (confirmLines(k, sheet.src, obj, picks, flags, paid, depositCollected)) close(); }} />;
    }
    if (k === 'sendWash') {
      return <CheckSheet mobile={mobile} onClose={close} title="Send to wash" verb="Send"
        sub="Pick what goes in this wash. It becomes one batch — not tracked per garment."
        items={data.pool.map((p) => ({ id: p.id, name: p.name, qty: p.qty, sub: `${p.flag ? '⚑ flagged · ' : ''}from ${p.from}, ${p.at}` }))}
        note="Due back in about a day. Items stay off the rack until you mark the batch washed."
        onConfirm={(ids) => { if (confirmSendWash(ids)) close(); }} />;
    }
    if (k === 'markWashed') {
      const b = data.batches.find((x) => x.id === sheet.id);
      if (!b) return null;
      return <CheckSheet mobile={mobile} onClose={close} title={`Mark Wash #${b.id} washed`} verb="Back on rack:"
        sub="Tick what has actually come back clean and pressed."
        items={b.lines.map((l) => ({ id: l.id, name: l.name, qty: l.qty }))}
        note="Only ticked pieces become available to book again."
        onConfirm={(ids) => { if (confirmWashed(b, ids)) close(); }} />;
    }
    if (k === 'time') {
      const ev = data.events.find((e) => e.id === sheet.id);
      if (!ev) return null;
      const counts = {};
      data.events.filter((e) => e.day === ev.day && e.status === 'pending').forEach((e) => { counts[e.time] = (counts[e.time] || 0) + 1; });
      return <TimeSheet ev={ev} counts={counts} dayLabel={isToday ? 'today' : shortDay(dayOff)} mobile={mobile} onClose={close}
        onConfirm={(to) => { if (doMove(ev, to)) close(); }} />;
    }
    if (k === 'search') return <SearchSheet mobile={mobile} data={data} onClose={close} onPick={(b) => { close(); info(`#${b.bid} ${b.name} opens on the Booking Detail screen.`); }} />;
    if (k === 'new') return <NewSheet mobile={mobile} onClose={close} onGo={() => { close(); info('Next: booking wizard, step 2 — dates, checked against stock with the 1-day prep buffer.'); }} />;
    return null;
  };

  const nav = (label) => info(`${label} is its own screen — not part of Home.`);

  /* ───── mobile composition ───── */
  if (mobile) {
    return (
      <div className="wh mobile">
        <style>{CSS}</style>
        <header className="m-top">
          <div>
            <div className="overline">{relDay(dayOff)}</div>
            <h1>{shortDay(dayOff)}</h1>
          </div>
          <div className="m-tools">
            {alertChip()}{offlineChip()}
            <button className="iconbtn" onClick={() => shift(-1)} aria-label="Previous day"><Icon n="ChevronLeft" size={22} /></button>
            <button className="iconbtn" onClick={() => shift(1)} aria-label="Next day"><Icon n="ChevronRight" size={22} /></button>
            <button className="iconbtn" onClick={() => setSheet({ kind: 'search' })} aria-label="Find a booking"><Icon n="Search" size={22} /></button>
          </div>
        </header>
        {banner()}
        {renderOverdue()}
        <main className="page">
          <div className="segm" role="tablist">
            <button role="tab" aria-selected={tab === 'schedule'} onClick={() => setTab('schedule')}>Schedule</button>
            <button role="tab" aria-selected={tab === 'laundry'} onClick={() => setTab('laundry')}>
              <Icon n="Droplet" size={16} />Laundry{laundryCount > 0 && <span className="cnt">{laundryCount}</span>}
            </button>
          </div>
          {tab === 'schedule' ? renderSchedule() : <div className="side">{renderLaundry()}{role !== 'staff' && !failed && renderDesk()}</div>}
        </main>
        <nav className="bar" aria-label="Main">
          <button className="on"><Icon n="House" size={22} />Home</button>
          <button onClick={() => nav('Bookings')}><Icon n="CalendarDays" size={22} />Bookings</button>
          <button className={cx('plus', offline && 'locked')} onClick={openNew} aria-label="New booking"><Icon n={offline ? 'Lock' : 'Plus'} size={26} sw={2.6} /></button>
          <button onClick={() => nav('Inventory')}><Icon n="Shirt" size={22} />Inventory</button>
          <button onClick={() => nav('More')}><Icon n="Menu" size={22} />More</button>
        </nav>
        {toastEl()}
        {renderSheet()}
      </div>
    );
  }

  /* ───── desktop composition ───── */
  const navItems = [['Home', true], ['Bookings'], ['Inventory'], ['Customers'], ...(role === 'owner' ? [['Reports'], ['Settings']] : [])];
  return (
    <div className="wh">
      <style>{CSS}</style>
      <header className="top">
        <div className="brand"><span className="mark">W</span>WedHub</div>
        <nav className="nav" aria-label="Main">
          {navItems.map(([label, on]) => <button key={label} className={on ? 'on' : undefined} onClick={() => !on && nav(label)}>{label}</button>)}
        </nav>
        <span className="sp" />
        {alertChip()}{offlineChip()}
        <button className="iconbtn" onClick={() => setSheet({ kind: 'search' })} aria-label="Find a booking (press /)"><Icon n="Search" size={20} /></button>
        <button className={cx('btn-new', offline && 'locked')} onClick={openNew}>
          <Icon n={offline ? 'Lock' : 'Plus'} size={20} sw={2.6} />New booking<kbd>N</kbd>
        </button>
        <span className="avatar" title={`${me.name} · ${me.title}`}>{me.ini}</span>
      </header>
      {banner()}
      {renderOverdue()}
      <main className="page">
        <div>{renderDayHead()}{renderSchedule()}</div>
        <aside className="side">{renderLaundry()}{role !== 'staff' && !failed && renderDesk()}</aside>
      </main>
      {toastEl()}
      {renderSheet()}
    </div>
  );
}
