// Update made: private repository sync test
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  House, CalendarDays, Shirt, UsersRound, Menu, Plus, Search, WifiOff, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownLeft, Droplet, Check, TriangleAlert, Phone, Clock, X, Lock, Minus, Info, RotateCw,
  ShieldCheck, Hourglass, CalendarClock, Flag, Settings, ChartNoAxesCombined, MessageCircle, Scissors, Sun, Moon,
} from 'lucide-react';

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
  --serif:'Outfit',system-ui,-apple-system,'Segoe UI',sans-serif;
  --sans:'Outfit',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  /* type scale — six sizes, nothing else. fs-body now covers what fs-label used to (base text, sub-lines, inputs). */
  --fs-display:42px; --fs-h2:22px; --fs-title:20px; --fs-body:15.5px; --fs-time:20px; --fs-meta:13px;
  --r-lg:16px; --r-md:12px; --r-sm:8px;
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px; --s7:48px;
  --rail:72px;
  --gutter:clamp(24px, 5vw, 72px);
  font:400 var(--fs-body)/1.5 var(--sans); letter-spacing:.005em; color:var(--ink); background:var(--paper);
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
.scrim{position:fixed;inset:0;z-index:50;background:var(--scrim);display:flex}
.sheet{background:var(--surface);display:flex;flex-direction:column;max-height:92vh;box-shadow:0 30px 80px rgba(0,0,0,.3)}
.sheet.center{margin:auto;width:520px;border-radius:var(--r-lg)}
.sheet.center.sheet-wide{width:min(940px,calc(100vw - 48px))}
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
.booking-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:4px;margin-bottom:18px;background:var(--sand);border-radius:10px}
.booking-steps span{position:relative;display:flex;align-items:center;justify-content:center;gap:7px;min-height:36px;color:var(--ink-3);font-size:11px;font-weight:700;white-space:nowrap}
.booking-steps span:not(:last-child)::after{content:'';position:absolute;left:calc(50% + 27px);right:calc(-50% + 27px);top:50%;height:1px;background:var(--line-2)}
.booking-steps b{position:relative;z-index:1;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--surface);font-size:11px}
.booking-steps i{font-style:normal}
.booking-steps span.on{background:var(--surface);border-radius:7px;color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.08)}
.booking-steps span.done{color:var(--wash)}
.booking-pane{display:grid;gap:14px}
.booking-pane label>span{display:block;margin:0 0 6px;font-size:12px;font-weight:700;color:var(--ink-2)}
.booking-grid{display:grid;gap:10px}.booking-grid.two{grid-template-columns:1fr 1fr}
.date-summary,.customer-intro{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid var(--line);border-radius:10px;background:var(--sand);color:var(--wash)}
.date-summary div,.customer-intro div{display:grid;gap:2px;color:var(--ink)}
.date-summary small,.customer-intro small{font-size:12px;color:var(--ink-2)}
.booking-check{display:flex;gap:10px;align-items:flex-start;padding:14px;border:1px solid var(--line-2);border-radius:10px;background:var(--surface)}
.booking-check input,.inline-check input{width:18px;height:18px;margin:2px 0 0;accent-color:var(--wash);flex:none}
.booking-check span{display:grid;gap:3px}.booking-check small{font-size:12px;line-height:1.4;color:var(--ink-2)}
.booking-tabs{display:flex;gap:6px;overflow:auto;padding-bottom:2px}.booking-tabs button{min-height:40px;padding:0 12px;border:1px solid var(--line-2);border-radius:8px;white-space:nowrap;font-size:12px;font-weight:700;color:var(--ink-2)}
.booking-tabs button[aria-selected=true]{background:var(--ink);border-color:var(--ink);color:#fff}
.booking-subtabs{display:flex;gap:6px;flex-wrap:wrap}.booking-subtabs button{min-height:32px;padding:0 10px;border:1px dashed var(--line-2);border-radius:7px;font-size:11px;font-weight:700;color:var(--ink-2)}.booking-subtabs button[aria-pressed=true]{border-style:solid;background:var(--sand);color:var(--ink)}
.booking-window{display:flex;gap:7px;align-items:center;flex-wrap:wrap;font-size:12px;font-weight:700;color:var(--ink-2)}.booking-window span{margin-left:auto;color:var(--wash);font-weight:600;font-size:11px}
.inventory-list{display:grid;gap:8px}.inventory-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:12px;border:1px solid var(--line);border-radius:10px;background:var(--surface)}.inventory-card.selected{border-color:var(--wash);box-shadow:inset 3px 0 var(--wash)}
.inventory-card>div:first-child{display:grid;gap:2px;min-width:0}.inventory-card b{font-size:14px}.inventory-card small{font-size:11px;color:var(--ink-2)}.inventory-card em{font-size:11px;color:var(--ink-2);font-style:normal}.stock-ok{color:var(--wash)!important}.stock-bad{color:var(--red)!important;font-weight:700}
.inventory-actions{display:flex;align-items:center}.inventory-actions .act{min-height:40px;padding:0 12px}.inventory-actions .step button{width:38px;height:38px}.inventory-actions .step output{min-width:28px;font-size:16px}
.item-dates{grid-column:1 / -1;display:grid;gap:8px;padding-top:10px;border-top:1px dashed var(--line)}.inline-check{display:flex!important;align-items:center;gap:7px!important;margin:0!important;font-size:12px!important;color:var(--ink-2)}
.booking-selection{display:grid;gap:3px;padding:11px 12px;border-left:3px solid var(--wash);background:var(--sand);font-size:12px}.booking-selection span{font-size:11px;color:var(--ink-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.inventory-screen{position:fixed;inset:0;z-index:55;overflow:auto;background:var(--paper);color:var(--ink);animation:wh-fade .16s ease-out}.inventory-screen-head{position:sticky;top:0;z-index:2;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;min-height:68px;padding:0 clamp(18px,4vw,64px);background:color-mix(in srgb,var(--surface) 92%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}.inventory-screen-head>div{display:grid;justify-items:center;gap:2px}.inventory-screen-head b{font-size:15px}.inventory-screen-head span{font-size:11px;color:var(--ink-2)}.inventory-back{justify-self:start;display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:0 12px;border:1px solid var(--line-2);border-radius:8px;font-weight:700;font-size:12px}.inventory-back:hover{background:var(--sand)}.inventory-screen-head .x{justify-self:end}.inventory-screen-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,38%);min-height:245px;background:#111827;color:#fff}.inventory-screen-hero>div:first-child{display:flex;flex-direction:column;justify-content:center;gap:12px;padding:clamp(28px,5vw,72px)}.inventory-screen-hero .overline{color:#B8C5D4}.inventory-screen-hero h1{max-width:720px;color:#fff;font-size:clamp(30px,4vw,58px);line-height:1.02;letter-spacing:-.045em}.inventory-screen-hero p{max-width:520px;color:#C8D1DC;font-size:14px}.inventory-hero-art{min-height:245px;background-image:linear-gradient(90deg,rgba(11,15,23,.15),rgba(11,15,23,.03)),url('https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1600&q=82');background-size:cover;background-position:center;filter:saturate(.72) contrast(1.06)}.inventory-screen-body{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:24px;max-width:1440px;margin:0 auto;padding:clamp(22px,4vw,56px) clamp(18px,4vw,64px) 80px}.inventory-catalog{min-width:0}.inventory-catalog-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:18px}.inventory-catalog-head h2,.inventory-selection h2{font-size:22px;letter-spacing:-.02em}.inventory-catalog-head p,.inventory-selection-head p{margin-top:3px;font-size:12px;color:var(--ink-2)}.inventory-date-chip{display:flex;align-items:center;gap:7px;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:var(--surface);font-size:11px;font-weight:700;white-space:nowrap}.inventory-category-rail{display:flex;gap:7px;overflow:auto;padding-bottom:4px;margin-bottom:18px}.inventory-category-rail button{min-height:42px;padding:0 14px;border:1px solid var(--line-2);border-radius:8px;white-space:nowrap;font-size:12px;font-weight:700;color:var(--ink-2)}.inventory-category-rail button[aria-selected=true]{background:var(--ink);border-color:var(--ink);color:#fff}.inventory-screen-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;grid-auto-flow:dense}.inventory-screen-card{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:var(--surface);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}.inventory-screen-card:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(16,24,40,.12)}.inventory-screen-card.selected{border-color:var(--wash);box-shadow:inset 3px 0 var(--wash)}.inventory-card-visual{height:128px;background-size:cover;background-position:center;filter:saturate(.72) contrast(1.05)}.inventory-screen-card-body{display:grid;gap:8px;padding:14px}.inventory-screen-card-body>div:first-child{display:grid;gap:3px}.inventory-screen-card-body b{font-size:15px}.inventory-screen-card-body p{font-size:12px;color:var(--ink-2)}.inventory-screen-card-body em{font-size:12px;font-style:normal;color:var(--ink-2);font-weight:700}.inventory-screen-card-body>span{font-size:11px;font-weight:700}.inventory-screen-card-action{display:flex;justify-content:flex-end}.inventory-screen-card-action .act{min-height:40px;padding:0 12px}.inventory-item-date{display:grid;gap:8px;padding-top:8px;border-top:1px dashed var(--line)}.inventory-selection{position:sticky;top:92px;align-self:start;display:grid;gap:14px;padding:18px;border:1px solid var(--line-2);border-radius:14px;background:var(--surface);box-shadow:0 12px 32px rgba(16,24,40,.09)}.inventory-selection-head{display:flex;justify-content:space-between;gap:10px;padding-bottom:12px;border-bottom:1px solid var(--line)}.inventory-selection-head span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--sand);font-weight:800}.inventory-selection-lines{display:grid;max-height:360px;overflow:auto}.inventory-selection-lines>div{display:flex;justify-content:space-between;gap:8px;padding:11px 0;border-bottom:1px solid var(--line)}.inventory-selection-lines span{display:grid;gap:3px;min-width:0}.inventory-selection-lines b{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.inventory-selection-lines small{font-size:10px;color:var(--ink-2)}.inventory-selection-lines button{width:30px;height:30px;border:1px solid var(--line-2);border-radius:7px;display:grid;place-items:center;flex:none}.inventory-selection-empty{display:grid;justify-items:center;gap:7px;padding:36px 12px;text-align:center;color:var(--ink-3)}.inventory-selection-empty b{color:var(--ink);font-size:13px}.inventory-selection-empty p{font-size:11px;line-height:1.45}.inventory-continue{display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:9px;background:var(--ink);color:#fff!important;font-weight:800;font-size:12px}.inventory-continue:disabled{opacity:.35}.inventory-continue:not(:disabled):hover{background:var(--wash)}
.inventory-layout{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:18px;align-items:start}.inventory-main{display:grid;gap:12px;min-width:0}.inventory-context{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:14px;border:1px solid var(--line);border-radius:10px;background:var(--sand)}.inventory-context div{display:grid;gap:3px}.inventory-context small{font-size:11px;color:var(--ink-2)}.inventory-context>span{display:flex;gap:6px;align-items:center;white-space:nowrap;font-size:11px;font-weight:700;color:var(--ink-2)}
.selection-tray{position:sticky;top:0;display:grid;gap:12px;padding:14px;border:1px solid var(--line-2);border-radius:12px;background:var(--surface);box-shadow:0 8px 24px rgba(16,24,40,.08)}.selection-tray-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;padding-bottom:10px;border-bottom:1px solid var(--line)}.selection-tray-head div{display:grid;gap:3px}.selection-tray-head small{font-size:11px;color:var(--ink-2)}.selection-tray-head>span{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--sand);font-size:12px;font-weight:800}.selection-lines{display:grid;gap:0;max-height:310px;overflow:auto}.selection-lines>div{display:flex;justify-content:space-between;gap:8px;padding:10px 0;border-bottom:1px solid var(--line)}.selection-lines span{display:grid;gap:2px;min-width:0}.selection-lines b{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.selection-lines small{font-size:10px;color:var(--ink-2);line-height:1.35}.selection-lines button{width:30px;height:30px;border:1px solid var(--line-2);border-radius:7px;display:grid;place-items:center;color:var(--ink-2);flex:none}.selection-lines button:hover{background:var(--sand);color:var(--red)}.selection-empty{display:grid;justify-items:center;gap:7px;text-align:center;padding:28px 10px;color:var(--ink-3)}.selection-empty p{font-weight:700;color:var(--ink);font-size:13px}.selection-empty small{font-size:11px;line-height:1.4}.selection-total{display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--line);font-size:12px;color:var(--ink-2)}.selection-total b{color:var(--ink);font-size:16px}
.review-head{display:flex;justify-content:space-between;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--line)}.review-head div{display:grid;gap:2px}.review-head small{font-size:12px;color:var(--ink-2)}.review-head>span{font-size:11px;font-weight:700;text-align:right;color:var(--ink-2)}
.review-lines{display:grid;gap:0}.review-lines>div{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);font-size:13px}.review-lines small{display:block;color:var(--ink-2);font-size:11px;margin-top:2px}.review-lines b{white-space:nowrap}.bill{display:grid;gap:2px;padding-top:8px}.bill .r{min-height:30px}.bill label{margin-top:10px}.balance-line{display:flex;justify-content:space-between;padding:10px 0;color:var(--ink-2);font-size:12px}.balance-line b{color:var(--ink);font-size:14px}
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
.cnt{background:var(--onyx);color:var(--onyx-ink);border-radius:99px;font-size:12px;min-width:20px;height:20px;display:grid;place-items:center;padding:0 6px}
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


/* ═════════════════════════════════════════════════════════════════════════
   v6 · Product design pass
   Visual system: neutral operations console, restrained semantic color,
   explicit hierarchy, individual work cards, exception-first rail, and
   mobile-first touch targets. No new dependencies.
   ═════════════════════════════════════════════════════════════════════════ */
.wh{
  --paper:#F6F8FB;
  --surface:#FFFFFF;
  --sand:#F2F4F7;
  --line:#E4E7EC;
  --line-2:#98A2B3;
  --ink:#101828;
  --ink-2:#475467;
  --ink-3:#667085;
  --pickup:#2563EB;
  --return:#B45309;
  --wash:#0F766E;
  --red:#B42318;
  --red-d:#912018;
  --amber:#B54708;
  --gold:#2563EB;
  --brand:#2563EB;
  --brand-strong:#1D4ED8;
  --brand-soft:#EEF4FF;
  --green:#027A48;
  --green-soft:#ECFDF3;
  --red-soft:#FEF3F2;
  --amber-soft:#FFFAEB;
  --teal-soft:#ECFDFB;
  /* a constant dark chip color that reads on both themes — logo mark, toast, stage badges */
  --onyx:#0F172A;
  --onyx-ink:#fff;
  --scrim:rgba(16,24,40,.46);
  --skel-a:#F2F4F7; --skel-b:#F9FAFB;
  --return-soft:#FFF7ED; --return-border:#FDBA74;
  --red-border:#FDA29B; --red-border-soft:#FECACA;
  --amber-border:#FEDF89; --amber-line:#F79009;
  --teal-border:#99D8D2;
  --brand-border:#B9D0FF; --brand-line:#8EB5FF;
  --color-scheme:light;
  color-scheme:var(--color-scheme);
  --serif:'Outfit',system-ui,-apple-system,'Segoe UI',sans-serif;
  --sans:'Outfit',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --r-xl:18px;
  --r-lg:14px;
  --r-md:10px;
  --r-sm:8px;
  --shadow-1:0 1px 2px rgba(16,24,40,.04),0 2px 6px rgba(16,24,40,.04);
  --shadow-2:0 8px 24px rgba(16,24,40,.08),0 2px 8px rgba(16,24,40,.04);
  --shadow-3:0 18px 48px rgba(16,24,40,.16),0 4px 16px rgba(16,24,40,.06);
  --gutter:clamp(20px,3vw,44px);
  color:var(--ink);
  background:var(--paper);
  letter-spacing:0;
}
.wh :focus-visible{outline:3px solid rgba(37,99,235,.24);outline-offset:2px}
.wh button:disabled{opacity:.52}
.overline{font-size:11px;line-height:1;font-weight:800;letter-spacing:.11em;color:var(--ink-3)}

/* Header */
.top{
  height:64px;
  gap:22px;
  padding:0 var(--gutter);
  background:rgba(255,255,255,.96);
  border-bottom:1px solid var(--line);
  box-shadow:0 1px 3px rgba(16,24,40,.03);
  backdrop-filter:blur(12px);
}
.brand{min-width:176px;gap:11px;font-size:17px;letter-spacing:-.01em}
.mark{width:34px;height:34px;border-radius:10px;background:var(--onyx);color:var(--onyx-ink);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);font:800 16px/1 var(--sans)}
.brand-lockup{display:grid;gap:2px;min-width:0}
.brand-name{font-size:15px;font-weight:800;line-height:1.1;color:var(--ink)}
.brand-context{font-size:10px;line-height:1;color:var(--ink-3);font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.nav{gap:4px;align-self:center}
.nav button{height:40px;padding:0 12px;border-radius:9px;display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--ink-2);position:relative}
.nav button:hover{background:var(--sand);color:var(--ink)}
.nav button.on{background:var(--brand-soft);color:var(--brand-strong)}
.nav button.on::after{display:none}
.iconbtn{width:40px;height:40px;border-radius:9px;color:var(--ink-2)}
.iconbtn:hover{background:var(--sand);color:var(--ink)}
.btn-new{height:40px;padding:0 13px;border:1px solid var(--brand-strong);border-radius:9px;background:var(--brand);box-shadow:0 1px 2px rgba(37,99,235,.2);font-size:13px}
.btn-new:hover{background:var(--brand-strong)}
.btn-new kbd{background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.18);margin-left:3px}
.btn-new.locked{background:var(--surface);border-color:var(--line-2);color:var(--ink-2);box-shadow:none}
.avatar{width:34px;height:34px;border:1px solid var(--line);background:var(--sand);font-size:12px;color:var(--ink)}
.pill{height:32px;border:1px solid transparent;font-size:12px}
.pill.alert{background:var(--red-soft);border-color:#FDA29B;color:var(--red)}
.pill.alert:hover{background:#FEE4E2}
.pill.offline{border:1px solid #98A2B3;background:var(--amber-soft);color:var(--amber)}
.banner{background:var(--amber-soft);border-bottom:1px solid #FEDF89;color:#7A2E0A;padding:10px var(--gutter);font-size:13px}

/* Overdue = exception module, not a red wall */
.od{background:transparent;border:0;color:var(--ink);scroll-margin-top:76px}
.od-in{max-width:1480px;margin:0 auto;padding:16px var(--gutter)}
.od-head{min-height:44px;padding:0 14px;gap:10px;margin:0;border:1px solid var(--red-border);border-bottom:0;border-radius:12px 12px 0 0;background:var(--red-soft);color:var(--red);font-size:14px}
.od-collapse{width:32px;height:32px;color:var(--red);border-radius:8px}
.od-collapse:hover{background:#FEE4E2}
.od-row{grid-template-columns:108px minmax(0,1fr) auto;gap:18px;padding:14px;border-top:1px solid var(--red-border-soft);background:var(--surface)}
.od-row:last-of-type{border-bottom:1px solid var(--red-border-soft)}
.od-late{font-size:13px;color:var(--red);background:var(--red-soft);border-radius:8px;padding:8px 10px;align-self:start;white-space:nowrap}
.od-who b{font-size:14px;color:var(--ink)}
.od-who span{opacity:1;color:var(--ink-3)}
.od-meta{font-size:13px;color:var(--ink-2);margin-top:4px}
.od-block{font-size:12px;color:var(--amber);margin-top:8px}
.od-btns{gap:8px}
.od-btn{height:38px;padding:0 12px;border:1px solid var(--line-2);border-radius:8px;background:var(--surface);color:var(--ink-2);font-size:12px}
.od-btn:hover{background:var(--sand);color:var(--ink)}
.od-btn.solid{background:var(--red);border-color:var(--red);color:#fff}
.od-btn.solid:hover{background:var(--red-d)}
.od-more{padding:11px 14px;border:1px solid var(--red-border-soft);border-top:0;border-radius:0 0 12px 12px;background:var(--surface);color:var(--red);font-size:12px}
.od-mini-row{max-width:1480px;margin:16px auto;padding:0 var(--gutter);min-height:48px;color:var(--red);background:var(--red-soft);border:1px solid var(--red-border);border-radius:10px}
.od-clear{max-width:1480px;margin:0 auto;padding:14px var(--gutter);color:var(--green);font-size:13px}

/* Workspace header */
.page{max-width:1480px;padding:30px var(--gutter) 96px;grid-template-columns:minmax(0,1fr) 348px;gap:28px}
.dayhead{display:block;padding-bottom:22px;margin-bottom:24px;border-bottom:1px solid var(--line)}
.dayhead-top{display:flex;align-items:flex-end;justify-content:space-between;gap:24px}
.daycopy{min-width:0}
.day-title-row{display:flex;align-items:center;gap:12px;margin-top:10px;flex-wrap:wrap}
.dayhead h1{font:700 42px/1.1 var(--serif);letter-spacing:-.015em;margin:0;padding:0;border:0;color:var(--ink)}
.day-status{display:inline-flex;align-items:center;height:27px;padding:0 10px;border-radius:99px;background:var(--green-soft);color:var(--green);font-size:11.5px;font-weight:800}
.day-sub{margin-top:9px;color:var(--ink-2);font-size:13.5px}
.daynav{gap:4px}
.daynav .iconbtn{background:var(--surface);border:1px solid var(--line)}
.daynav .iconbtn:hover{background:var(--sand)}
.textbtn{height:40px;padding:0 10px;color:var(--brand);font-size:13px;text-decoration:none;border-radius:8px}
.textbtn:hover{background:var(--brand-soft);text-decoration:none}
.daystats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:18px}
.stat{min-height:72px;padding:12px 14px;background:var(--surface);border:1px solid var(--line);border-radius:11px;box-shadow:var(--shadow-1)}
.stat-label{font-size:11.5px;color:var(--ink-3);font-weight:700}
.stat-value{margin-top:5px;font-size:23px;line-height:1.1;font-weight:800;letter-spacing:-.025em;font-variant-numeric:tabular-nums}
.stat-note{margin-top:4px;font-size:11.5px;color:var(--ink-3)}

/* Timeline / appointment cards */
.tl{position:relative}
.tl::before{left:72px;border-left:1px solid var(--line)}
.slot{grid-template-columns:72px minmax(0,1fr);margin-bottom:14px}
.time{padding:13px 18px 0 0;font:700 15px/1 var(--serif);color:var(--ink-2)}
.time small{margin-top:6px;font:700 10.5px/1 var(--sans);color:var(--ink-3);letter-spacing:.04em}
.time::after{right:-5px;top:14px;width:10px;height:10px;background:var(--paper);border:2px solid #98A2B3}
.group{margin-left:16px;background:transparent;border-radius:0;overflow:visible}
.group.focus{background:transparent;color:var(--ink);border:0}
.group .tab{height:34px;padding:0 10px;background:transparent;color:var(--ink-3);font-size:11px;border:0;text-transform:uppercase;letter-spacing:.07em}
.group.focus .tab{background:var(--brand-soft);border:1px solid var(--brand-border);border-bottom:0;border-radius:10px 10px 0 0;color:var(--brand-strong);padding-left:12px}
.rows{display:grid;gap:8px}
.rows>li+li{border:0}
.group.focus .rows>li+li{border:0}
.group.focus .bid,.group.focus .row-sub,.group.focus .party,.group.focus .hint,.group.focus .money{color:var(--ink-2)}
.group.focus .flag.late{color:var(--amber)}
.group.focus .flag.wash{color:var(--wash)}
.group.focus .chips li{border-color:var(--line);color:var(--ink)}
.group.focus .chips li.short{border-color:#7FD8D0;color:var(--wash)}
.group.focus .link,.group.focus .iconlink{color:var(--ink-2);border-color:var(--line)}
.group.focus .iconlink:hover{background:var(--sand)}
.group.focus .link{text-decoration-color:var(--line-2)}
.group.focus .chev{color:var(--ink-3)}
.row{background:var(--surface);border:1px solid var(--line);border-radius:13px;box-shadow:var(--shadow-1);overflow:hidden;transition:border-color .16s ease,box-shadow .16s ease,transform .16s ease}
.row:hover{border-color:#CDD5DF;box-shadow:var(--shadow-2)}
.row.focused{border-color:var(--brand-line);box-shadow:0 0 0 1px rgba(37,99,235,.10),var(--shadow-2)}
.row.return{--c:var(--return)}
.row.wash{--c:var(--wash)}
.row-line{grid-template-columns:minmax(0,1fr) auto;gap:16px;padding:13px 14px}
.row-hit{gap:12px;padding:0;border-radius:9px}
.row-hit:hover{background:transparent}
.glyph{width:38px;height:38px;border-radius:10px;box-shadow:none}
.glyph.return{background:var(--return-soft);color:var(--return);box-shadow:inset 0 0 0 1.5px var(--return-border)}
.glyph.wash{background:var(--teal-soft);color:var(--wash);border-radius:10px}
.row-text{gap:3px}
.row-name{gap:7px}
.row-name b{font-size:16px;line-height:1.3;letter-spacing:-.012em}
.bid{font-size:11px;color:var(--ink-3)}
.row-sub{font-size:12px;color:var(--ink-2)}
.kind{display:inline-flex;align-items:center;margin-right:5px;font-size:11px;font-weight:800;letter-spacing:.01em;color:var(--c)}
.flag{font-size:11px}
.flag.late{color:var(--amber)}
.flag.wash{color:var(--wash)}
.chip-alt{height:22px;padding:0 7px;background:var(--amber-soft);border:1px solid var(--amber-border);color:var(--amber);font-size:10px}
.chev{color:var(--ink-3)}
.row-action{display:flex;align-items:center}
.act{height:38px;min-width:116px;padding:0 12px;border:1px solid var(--c);border-radius:8px;font-size:12px;box-shadow:none}
.act:hover{filter:none}
.act.solid{background:var(--c);border-color:var(--c);box-shadow:0 1px 2px rgba(16,24,40,.08)}
.act.solid:hover{filter:brightness(.97)}
.act.dark{--c:#344054}
.act.locked{border-style:dashed;background:var(--surface);color:var(--ink-2)}
.act:active{transform:translateY(1px)}
.row-more{padding:0 14px 14px 64px;border-top:1px solid var(--line)}
.row-more-inner{padding-top:13px;display:grid;gap:12px}
.party{font-size:12px;color:var(--ink-2);margin:0}
.detail-label{font-size:10px;line-height:1;text-transform:uppercase;letter-spacing:.08em;font-weight:800;color:var(--ink-3);margin-bottom:6px}
.chips{gap:6px}
.chips li{background:var(--sand);border:1px solid var(--line);border-radius:7px;padding:5px 8px;font-size:11px}
.chips li.short{border:1px dashed #66BEB6;background:var(--teal-soft);color:var(--wash)}
.money{margin:0;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:#FBFCFE;font-size:12px;font-weight:700}
.more-actions{gap:6px;margin:0;align-items:center}
.link{min-height:34px;padding:0 8px;border-radius:7px;font-size:11px;text-decoration:none;color:var(--ink-2)}
.link:hover{background:var(--sand);color:var(--ink)}
.iconlink{width:34px;height:34px;border:1px solid var(--line);border-radius:7px;color:var(--ink-2)}
.iconlink:hover{background:var(--sand)}
.hint{margin:0;padding:10px 12px;border-radius:8px;background:var(--amber-soft);color:var(--amber);font-size:11px}
.hint .link{padding:0;font-weight:800;color:var(--amber);background:none}
.row-more>.act{margin-top:0}
.marker{margin-top:0;border:1px dashed var(--teal-border);background:var(--teal-soft);border-radius:11px;padding:10px 12px;min-height:52px;box-shadow:none}
.marker .glyph{width:30px;height:30px;border-radius:8px}
.marker p{font-size:12px;color:var(--ink-2)}
.marker p b{color:var(--ink)}
.marker .link{color:var(--wash);font-weight:800}
.now{grid-template-columns:72px minmax(0,1fr);margin:4px 0 14px}
.now-t{justify-self:end;margin-right:6px;padding:5px 8px;border-radius:99px;background:var(--brand);color:#fff;font-size:10px;letter-spacing:.02em}
.now i{height:1px;background:var(--brand-line)}
.done{margin:0 0 18px 88px;padding:8px 0;border-bottom:1px solid var(--line)}
.done-toggle{height:34px;color:var(--ink-2);font-size:11px;font-weight:800}
.done-list{margin-top:6px}
.done-list li{grid-template-columns:62px minmax(0,1fr);padding:8px 0;border-top:1px solid var(--line);font-size:11px;color:var(--ink-2)}
.done-list b{font-weight:700;color:var(--ink)}
.done-list .by{font-size:10px;color:var(--ink-3)}

/* Right rail */
.side{gap:14px;align-content:start;position:sticky;top:82px}
.rail-card{background:var(--surface);border:1px solid var(--line);border-radius:13px;box-shadow:var(--shadow-1);padding:16px}
.side h2{margin:0;display:flex;align-items:center;gap:9px;font:800 15.5px/1.25 var(--sans);letter-spacing:-.01em;color:var(--ink)}
.rail-icon{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;background:var(--teal-soft);color:var(--wash)}
.rail-count{margin-left:auto;min-width:24px;height:24px;padding:0 7px;display:grid;place-items:center;border-radius:99px;background:var(--sand);color:var(--ink-2);font-size:10px}
.rule{margin:10px 0 0;padding:9px 10px;border-radius:8px;background:var(--sand);font-size:11px;color:var(--ink-2)}
.pipe{margin-top:16px}
.stage{grid-template-columns:28px minmax(0,1fr);column-gap:10px;padding-bottom:20px}
.stage::before{left:13px;top:30px;bottom:4px;border-left:1px dashed var(--line-2)}
.stage-n{width:28px;height:28px;background:var(--onyx);color:var(--onyx-ink);font-size:10px;box-shadow:0 0 0 4px var(--surface);z-index:1}
.stage:nth-child(1) .stage-n{background:var(--brand)}
.stage:nth-child(2) .stage-n{background:var(--wash)}
.stage:nth-child(3) .stage-n{background:var(--ink-3)}
.stage h3{font-size:12px;line-height:28px;font-weight:800;color:var(--ink)}
.stage .empty{margin-top:4px;font-size:11px;color:var(--ink-3)}
.plain{margin-top:8px;gap:6px}
.plain li{font-size:11px;line-height:1.35}
.plain li b{font-weight:700;color:var(--ink)}
.plain li span{font-size:10px;color:var(--ink-3)}
.stage .act{width:100%;height:36px;margin-top:10px}
.batch{margin-top:10px;padding:10px 0 0;border-top:1px solid var(--line)}
.batch:first-of-type{padding-top:0}
.batch.late{border-left:3px solid var(--amber-line);padding:10px 0 0 10px;border-top:0}
.batch-h b{font-size:11px}
.batch-h span{font-size:10px;color:var(--wash)}
.batch.late .batch-h span{color:var(--amber)}
.batch p{font-size:11px;color:var(--ink-2);margin-top:3px;line-height:1.4}
.need{font-size:10px;margin-top:7px;color:var(--amber)}
.rack li{gap:7px;padding:3px 0}
.rack svg{color:var(--green)}
.desk-card h2{margin-bottom:4px}
.desk li{padding:10px 0;border-top:1px solid var(--line);grid-template-columns:1fr auto;gap:3px 10px}
.desk li:first-child{margin-top:8px}
.desk li b{font-size:11px;line-height:1.35}
.desk li small{font-size:10px;color:var(--ink-3)}
.desk .act{height:32px;min-width:74px;font-size:11px}
.desk .empty{margin-top:8px;font-size:11px;color:var(--ink-3)}

/* States */
.state{padding:28px 0}
.tl .state{margin-left:88px}
.state h2{font-size:20px;line-height:1.3;letter-spacing:-.01em}
.state p{font-size:13.5px;color:var(--ink-2);max-width:60ch;line-height:1.55}
.state .btns{gap:8px;margin-top:16px}
.state .code{font-size:10px;color:var(--ink-3)}
.state.err{border:1px solid #FDA29B;border-left:3px solid var(--red);padding:18px;border-radius:11px;background:var(--red-soft)}
.skel{gap:8px}
.skel i{height:102px;border:1px solid var(--line);border-radius:13px;background:linear-gradient(90deg,var(--skel-a),var(--skel-b),var(--skel-a));background-size:200% 100%}

/* Sheets / dialogs */
.scrim{background:rgba(16,24,40,.46);backdrop-filter:blur(2px)}
.sheet{border:1px solid rgba(255,255,255,.28);box-shadow:var(--shadow-3);background:var(--surface)}
.sheet.center{width:560px;border-radius:16px}
.sheet.bottom{border-radius:18px 18px 0 0}
.sheet-h{padding:20px 20px 10px}
.sheet-h h2{font-size:19px;line-height:1.25;letter-spacing:-.008em}
.sheet-h p{font-size:12.5px;color:var(--ink-2);margin-top:5px;line-height:1.5}
.sheet-b{padding:8px 20px 16px}
.sheet-f{padding:12px 20px 20px;border-top:1px solid var(--line);background:#FBFCFE}
.sheet-f .act{height:44px}
.pick{padding:12px 0;border-top:1px solid var(--line)}
.pick b{font-size:12px}
.pick small{font-size:10px;color:var(--ink-3)}
.pick small.w{color:var(--amber)}
.cond{font-size:10px;color:var(--ink-3)}
.cond button{height:34px;border:1px solid var(--line);border-radius:7px;font-size:11px}
.cond button[aria-pressed=true]{background:var(--onyx);color:var(--onyx-ink);border-color:var(--onyx)}
.cond button.bad[aria-pressed=true]{background:var(--red);border-color:var(--red)}
.step{border:1px solid var(--line);border-radius:8px}
.step button{width:38px;height:38px}
.step output{font-size:13px}
.chk{padding:11px 0;border-top:1px solid var(--line)}
.box{width:22px;height:22px;border-radius:6px;border:1px solid var(--line-2)}
.inp{height:46px;border:1px solid var(--line-2);border-radius:8px;font-size:14px;box-shadow:inset 0 1px 2px rgba(16,24,40,.03)}
.inp:focus{border-color:#84ADFF;outline:none;box-shadow:0 0 0 3px rgba(37,99,235,.12)}
.note{margin-top:12px;padding:10px;border-radius:8px;background:var(--sand);font-size:11px;color:var(--ink-2)}
.note.warn{background:var(--amber-soft);color:var(--amber)}
.tg{gap:7px;margin-top:4px}
.tg button{height:48px;border:1px solid var(--line);border-radius:8px;font-size:11px}
.tg button[aria-pressed=true]{background:var(--brand);border-color:var(--brand);color:#fff}
.tg button[aria-pressed=true] small{color:#DDE9FF}
.tg button.cur{border-style:dashed;border-color:var(--brand)}
.res button{padding:11px 0;min-height:48px;border-top:1px solid var(--line)}
.res span{font-size:12px}
.x{width:36px;height:36px;border-radius:8px}
.x:hover{background:var(--sand)}
.sum{padding:12px 20px;border-top:1px solid var(--line);background:#FBFCFE}
.rows-sum{gap:5px}
.rows-sum .r{font-size:12px}
.rows-sum .r.total{font-size:12px;border-top:1px solid var(--ink)}
.rows-sum .r.total b{font-size:15px}
.pay button{height:40px;min-width:72px;border:1px solid var(--line);border-radius:8px}
.pay button[aria-checked=true]{background:var(--brand);border-color:var(--brand)}
.depchk{font-size:11px}
.toast{bottom:22px;border:1px solid rgba(255,255,255,.08);border-radius:10px;box-shadow:var(--shadow-3);font-size:12px;background:var(--onyx);color:var(--onyx-ink)}
.toast>button{color:#C7D7FF;font-size:12px}
.toast.offline{border:1px solid var(--amber-border);background:var(--amber-soft);color:var(--amber)}

/* Mobile */
.mobile{--rail:54px;--gutter:16px;--fs-display:26px;--fs-title:16px;--fs-body:14px}
.mobile .m-top{min-height:72px;padding:11px 12px 11px 16px;background:rgba(255,255,255,.97);border-bottom:1px solid var(--line);box-shadow:0 1px 3px rgba(16,24,40,.04)}
.m-top-copy{display:grid;gap:6px;min-width:0}
.m-brand{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-3)}
.m-brand b{color:var(--ink);letter-spacing:0;font-size:12px}
.m-date{display:flex;align-items:center;gap:8px;min-width:0}
.m-date h1{font:700 28px/1.05 var(--serif);letter-spacing:-.01em;white-space:nowrap}
.m-tools{gap:2px}
.mobile .iconbtn{width:40px;height:40px}
.mobile .banner{padding:9px 16px;font-size:11px;line-height:1.35}
.mobile .od{margin:0 12px}
.mobile .od-in{padding:10px 0}
.mobile .od-head{padding:0 11px;min-height:42px;font-size:12px}
.mobile .od-row{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"late btns" "who btns";gap:3px 10px;padding:11px}
.mobile .od-late{font-size:11px;padding:6px 8px}
.mobile .od-who b{font-size:12px}
.mobile .od-meta{font-size:11px}
.mobile .od-btn.call{width:38px;height:38px;padding:0;border-radius:8px}
.mobile .od-btn.solid{width:38px;height:38px;padding:0;border-radius:8px}
.mobile .page{display:block;padding:14px 16px 116px}
.mobile .segm{background:var(--sand);padding:3px;border-radius:9px;margin-bottom:16px;border:1px solid var(--line)}
.mobile .segm button{height:40px;border-radius:7px;font-size:12px}
.mobile .segm button[aria-selected=true]{background:var(--surface);box-shadow:0 1px 2px rgba(16,24,40,.06)}
.mobile .tl::before{left:54px}
.mobile .slot{grid-template-columns:54px minmax(0,1fr);margin-bottom:10px}
.mobile .time{padding-right:12px;padding-top:13px;font-size:12px}
.mobile .time::after{right:-5px;top:14px;width:10px;height:10px}
.mobile .time small{font-size:10px}
.mobile .group{margin-left:10px}
.mobile .group .tab{height:30px;padding:0 8px;font-size:10px}
.mobile .group.focus .tab{padding-left:9px}
.mobile .rows{gap:7px}
.mobile .row{border-radius:12px}
.mobile .row-line{grid-template-columns:minmax(0,1fr);gap:0;padding:11px}
.mobile .row-hit{gap:10px}
.mobile .glyph{width:36px;height:36px}
.mobile .row-name b{font-size:15px}
.mobile .row-sub{font-size:11px;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.mobile .flag{font-size:10px}
.mobile .chip-alt{height:20px;font-size:10px}
.mobile .row-more{padding:0 11px 12px 57px}
.mobile .row-more-inner{padding-top:11px;gap:10px}
.mobile .row-more .act{width:100%;height:44px;margin-top:0}
.mobile .more-actions{gap:4px}
.mobile .more-actions .link{min-height:32px}
.mobile .done{margin:0 0 14px 64px}
.mobile .done-toggle{height:32px;font-size:10px}
.mobile .now{grid-template-columns:54px minmax(0,1fr);margin-bottom:10px}
.mobile .now-t{font-size:10px;padding:4px 7px}
.mobile .marker{padding:9px 10px;min-height:48px}
.mobile .marker p{font-size:11px}
.mobile .side{position:static;gap:10px}
.mobile .rail-card{padding:13px;border-radius:12px}
.mobile .side h2{font-size:13px}
.mobile .rail-icon{width:28px;height:28px}
.mobile .stage{padding-bottom:16px}
.mobile .bar{height:auto;grid-template-columns:1fr 1fr 68px 1fr 1fr;padding:5px 0 calc(5px + env(safe-area-inset-bottom,0px));background:rgba(255,255,255,.98);box-shadow:0 -2px 8px rgba(16,24,40,.05)}
.mobile .bar button{height:50px;font-size:10px;color:var(--ink-3)}
.mobile .bar button.on{color:var(--brand-strong)}
.mobile .bar .plus{width:52px;height:52px;background:var(--brand);box-shadow:0 6px 16px rgba(37,99,235,.25)}
.mobile .bar .plus.locked{background:var(--surface);color:var(--ink);border:1px dashed var(--line-2);box-shadow:none}
.mobile .toast{bottom:76px;max-width:calc(100vw - 28px)}

@media (max-width:1240px){
  .page{grid-template-columns:minmax(0,1fr) 312px}
  .nav button{padding:0 9px}
  .brand{min-width:150px}
}
@media (max-width:1080px){
  .page{grid-template-columns:minmax(0,1fr) 288px;gap:20px}
}
@media (max-width:920px){
  .page{grid-template-columns:1fr}
  .side{position:static}
  .rail-card{padding:14px}
}
@media (max-width:819px){
  .mobile .dsk,.mobile .od-btn.ext{display:none}
}
@media (prefers-reduced-motion:reduce){
  .wh *, .wh *::before, .wh *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
}

/* Operational rhythm: short, predictable transitions and dense scan lines. */
.view-enter{animation:wh-enter .16s ease-out both}
.row-more-enter{animation:wh-expand .14s ease-out both}
.scrim-enter{animation:wh-fade .14s ease-out both}
.sheet-enter{animation:wh-sheet .18s ease-out both}
.toast-enter{animation:wh-toast .18s ease-out both}
@keyframes wh-enter{from{opacity:.72;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes wh-expand{from{opacity:.5;transform:translateY(-3px)}to{opacity:1;transform:none}}
@keyframes wh-fade{from{opacity:0}to{opacity:1}}
@keyframes wh-sheet{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
@keyframes wh-toast{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
.iconbtn,.x,.od-btn,.act,.btn-new,.bar button,.segm button{min-height:44px}
.daystats{grid-template-columns:repeat(4,minmax(112px,1fr));gap:8px}
.stat{min-height:68px;padding:10px 12px}
.page{gap:24px}
.rows{gap:6px}
.row{border:1px solid var(--line);border-radius:11px;background:var(--surface);box-shadow:var(--shadow-1)}
.group.focus .rows .row{border-color:var(--brand-border)}
.group.focus .rows{padding:0 1px 1px}
.group .tab{font-size:10px;letter-spacing:.1em}
.top{height:60px}
.top .nav button{min-height:44px}
@media (max-width:819px){
  .mobile .iconbtn{width:44px;height:44px}
  .mobile .m-tools{gap:1px}
  .mobile .page{padding-bottom:124px}
  .mobile .row{box-shadow:none}
  .mobile .bar button{min-height:52px}
}

/* Final console pass: keep the exception module framed at every width. */
.od{max-width:1480px;margin:0 auto;padding:0 var(--gutter);background:transparent;color:var(--ink)}
.od-in{max-width:none;margin:0;padding:0;border:1px solid var(--red-border);border-radius:10px;overflow:hidden;background:var(--surface)}
.od-head{border:0;border-bottom:1px solid var(--red-border-soft);border-radius:0;background:var(--red-soft);padding:0 14px;min-height:46px}
.od-row{border-top:1px solid var(--line);padding:14px 14px;background:var(--surface)}
.od-row:last-of-type{border-bottom:0}
.od-more{border:0;border-top:1px solid var(--line);border-radius:0;padding:12px 14px;background:var(--surface)}
.od-mini{padding:0 var(--gutter)}
.od-mini-row{margin:0;padding:0 14px;border:1px solid var(--red-border);border-radius:10px;background:var(--red-soft);color:var(--red)}
.od-clear{padding-left:var(--gutter);padding-right:var(--gutter)}
.top{background:#182230;color:#F8FAFC;border-bottom-color:#263447}
.top .brand-name,.top .brand{color:#F8FAFC}
.top .brand-context,.top .nav button,.top .iconbtn{color:#AAB7C8}
.top .nav button:hover{background:#243245;color:#fff}
.top .nav button.on{background:#2C4059;color:#fff}
.top .avatar{background:#263447;border-color:#3A4A60;color:#F8FAFC}
.top .btn-new{background:#F8FAFC;border-color:#F8FAFC;color:#182230}
.top .btn-new:hover{background:#DDE7F2}
.top .iconbtn:hover{background:#243245;color:#fff}
.row,.rail-card,.stat{border-radius:9px;box-shadow:0 1px 2px rgba(16,24,40,.05)}
.row:hover{box-shadow:0 2px 8px rgba(16,24,40,.08)}
@media (min-width:820px) and (max-width:1080px){
  .top{gap:10px;padding:0 18px}
  .brand{min-width:132px}
  .brand-context,.top .btn-new kbd{display:none}
  .page{padding-left:20px;padding-right:20px}
}
@media (max-width:819px){
  .mobile .od{margin:0;padding:0 16px}
  .mobile .od-in{padding:0}
  .mobile .od-mini{padding:0 16px}
  .mobile .od-mini-row{padding:0 12px}
  .mobile .od-head{padding:0 12px}
  .mobile .od-row{padding:12px}
  .mobile .m-tools .pill{display:none}
  .mobile .od-btn.solid{width:38px;height:38px;padding:0;overflow:hidden}
  .mobile .od-btn.solid .lbl{display:none}
  .mobile .m-top{background:#182230;color:#F8FAFC;border-bottom-color:#263447}
  .mobile .m-brand,.mobile .m-date h1{color:#F8FAFC}
  .mobile .m-brand b,.mobile .m-date .overline{color:#AAB7C8}
  .mobile .m-tools .iconbtn{color:#D6E0EC}
  .mobile .m-tools .iconbtn:hover{background:#243245}
  .mobile .dayhead-top{align-items:flex-start}
  .mobile .dayhead h1{font-size:30px}
  .mobile .daystats{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
  .mobile .stat{min-height:64px}
}
@media (max-width:420px){
  .mobile .m-tools .iconbtn:nth-last-child(2){display:none}
  .mobile .m-date h1{font-size:25px}
  .mobile .page{padding-left:12px;padding-right:12px}
  .mobile .od{padding-left:12px;padding-right:12px}
  .mobile .od-mini{padding-left:12px;padding-right:12px}
}

/* Desktop composition: a compact control rail keeps the workspace dense and task-first. */
@media (min-width:820px){
  .wh:not(.mobile){padding-left:220px;min-height:100vh;background:var(--paper)}
  .wh:not(.mobile) .top{position:fixed;inset:0 auto 0 0;width:220px;height:100vh;z-index:30;display:flex;flex-direction:column;align-items:stretch;gap:18px;padding:22px 14px;background:#101923;border:0;color:#F6F8FB;box-shadow:12px 0 30px rgba(5,10,18,.16)}
  .wh:not(.mobile) .top{border-right:1px solid #304258}
  .wh:not(.mobile) .brand{min-width:0;padding:0 10px 20px;border-bottom:1px solid #263546}
  .wh:not(.mobile) .brand-name{color:#F6F8FB}
  .wh:not(.mobile) .brand-context{color:#91A1B4}
  .wh:not(.mobile) .nav{display:grid;gap:5px;align-self:stretch}
  .wh:not(.mobile) .nav button{justify-content:flex-start;height:44px;padding:0 12px;color:#9FAFC2;border-radius:7px}
  .wh:not(.mobile) .nav button.on{background:#22364C;color:#F6F8FB;box-shadow:inset 3px 0 0 #6EA1FF}
  .wh:not(.mobile) .nav button:hover{background:#1C2B3B;color:#fff}
  .wh:not(.mobile) .top .sp{flex:1}
  .wh:not(.mobile) .top>.brand{order:1}
  .wh:not(.mobile) .top>.nav{order:2}
  .wh:not(.mobile) .top>.btn-new{order:3}
  .wh:not(.mobile) .top>.sp{order:4}
  .wh:not(.mobile) .top>.pill{order:5}
  .wh:not(.mobile) .top>.theme-toggle{order:6}
  .wh:not(.mobile) .top>.iconbtn{order:7}
  .wh:not(.mobile) .top>.avatar{order:8}
  .wh:not(.mobile) .top>.pill{width:100%;justify-content:flex-start}
  .wh:not(.mobile) .top>.iconbtn{align-self:flex-start}
  .wh:not(.mobile) .top>.theme-toggle,.wh:not(.mobile) .top>.top-tool{width:100%;height:44px}
  .wh:not(.mobile) .top>.btn-new{width:100%;justify-content:flex-start;background:#6EA1FF;border-color:#6EA1FF;color:#08111B}
  .wh:not(.mobile) .top>.avatar{align-self:flex-start}
  .wh:not(.mobile) .page{padding-top:18px}
  .wh:not(.mobile) .side{top:18px}
  .wh:not(.mobile) .dayhead{padding:16px;margin-bottom:16px;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
  .wh:not(.mobile) .dayhead h1{font-size:36px}
  .wh:not(.mobile) .dayhead-top{padding-bottom:12px;border-bottom:1px solid var(--line)}
  .wh:not(.mobile) .daystats{margin-top:12px}
  .wh:not(.mobile) .stat{border-top:3px solid var(--brand);border-radius:7px}
  .wh:not(.mobile) .stat:nth-child(2){border-top-color:var(--green)}
  .wh:not(.mobile) .stat:nth-child(3){border-top-color:var(--pickup)}
  .wh:not(.mobile) .stat:nth-child(4){border-top-color:var(--return)}
  .wh:not(.mobile) .od{padding-top:12px;padding-bottom:12px}
  .wh:not(.mobile) .od-in{box-shadow:0 5px 18px rgba(16,24,40,.08)}
  .wh:not(.mobile) .od-head{padding:0 16px;min-height:50px}
  .wh:not(.mobile) .od-row{padding:17px 16px}
}
@media (min-width:820px) and (max-width:1080px){
  .wh:not(.mobile){padding-left:184px}
  .wh:not(.mobile) .top{width:184px;padding-left:10px;padding-right:10px}
  .wh:not(.mobile) .brand{padding-left:6px}
  .wh:not(.mobile) .page{grid-template-columns:1fr}
  .wh:not(.mobile) .side{position:static;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
}
.wh[data-theme="dark"] .act.solid.wash{color:#061B1A}
.wh[data-theme="dark"] .stage:nth-child(2) .stage-n{color:#061B1A}
.wh[data-theme="dark"] .marker .glyph.wash{color:#67E8DF}
.od{scroll-margin-top:18px}
.brand-date{display:block;margin-top:5px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#91A1B4}
.top-action-label{font-size:11px;font-weight:800;white-space:nowrap}
.top-tool,.theme-toggle{display:inline-flex;align-items:center;justify-content:flex-start;gap:8px;padding:0 10px}
.mobile .top-action-label{display:none}
.side{padding-top:0}
.mobile .side{margin-top:0}
.mobile .side>.rail-card:first-child{margin-top:0}
.wh:not(.mobile):not([data-theme="dark"]){--paper:#E7EDF3;--surface:#F7F9FB;--sand:#DCE5EE;--line:#C4D0DC;--line-2:#8797A8;--ink:#17202B;--ink-2:#445466;--ink-3:#647589;--brand:#285EA8;--brand-strong:#1E4E90;--brand-soft:#DCE9F8;--green:#13795B;--green-soft:#DDF4EA;--red-soft:#FBE4E2;--amber-soft:#FFF0D1;--teal-soft:#D9F2EF}
.wh:not(.mobile):not([data-theme="dark"]) .top{background:#E7EDF3;color:#17202B;border-right-color:#B3C0CE;box-shadow:12px 0 30px rgba(41,56,72,.12)}
.wh:not(.mobile):not([data-theme="dark"]) .top .brand-name,.wh:not(.mobile):not([data-theme="dark"]) .top .brand{color:#17202B}
.wh:not(.mobile):not([data-theme="dark"]) .top .brand-context,.wh:not(.mobile):not([data-theme="dark"]) .top .nav button,.wh:not(.mobile):not([data-theme="dark"]) .top .iconbtn{color:#586B7E}
.wh:not(.mobile):not([data-theme="dark"]) .top .brand{border-color:#C1CDD9}
.wh:not(.mobile):not([data-theme="dark"]) .top .nav button:hover{background:#D5E0EB;color:#17202B}
.wh:not(.mobile):not([data-theme="dark"]) .top .nav button.on{background:#C9DCF2;color:#1E4E90;box-shadow:inset 3px 0 0 #285EA8}
.wh:not(.mobile):not([data-theme="dark"]) .top>.btn-new{background:#285EA8;border-color:#285EA8;color:#fff}
.wh:not(.mobile):not([data-theme="dark"]) .top .avatar{background:#D5E0EB;border-color:#B5C4D3;color:#17202B}
.wh:not(.mobile):not([data-theme="dark"]) .brand-date{color:#607286}
.wh[data-theme="dark"] .top-action-label{color:#C7D3E0}
.wh:not(.mobile):not([data-theme="dark"]) .top-action-label{color:#506377}
.wh:not(.mobile) .top-tool:hover,.wh:not(.mobile) .theme-toggle:hover{background:#243245;color:#fff}
.wh:not(.mobile):not([data-theme="dark"]) .top-tool:hover,.wh:not(.mobile):not([data-theme="dark"]) .theme-toggle:hover{background:#D5E0EB;color:#17202B}
.quick-booking{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:center;padding:13px;background:var(--surface);border:1px solid var(--brand-border);border-left:3px solid var(--brand);border-radius:9px;box-shadow:var(--shadow-1)}
.quick-booking-icon{width:32px;height:32px;display:grid;place-items:center;border-radius:7px;background:var(--brand);color:#fff}
.quick-booking-copy{min-width:0}
.quick-booking-copy h2{font-size:13px;line-height:1.2;font-weight:800;color:var(--ink)}
.quick-booking-copy p{margin-top:3px;font-size:10px;line-height:1.35;color:var(--ink-3)}
.quick-booking-action{grid-column:1 / -1;display:flex;align-items:center;justify-content:center;gap:6px;height:36px;border-radius:7px;background:var(--brand);color:#fff;font-size:11px;font-weight:800}
.quick-booking-action:hover{background:var(--brand-strong)}
.quick-booking-action.locked{background:var(--sand);color:var(--ink-2);border:1px dashed var(--line-2)}
.pipe .stage::before{content:'';left:13px;top:30px;bottom:4px;border-left:2px dotted #99D8D2}
.wh[data-theme="dark"] .pipe .stage::before{border-left-color:#4FD1C5}
.pipe .stage{padding-bottom:22px}
.pipe .stage:last-child{padding-bottom:0}
.marker{background:var(--surface);border:1px dashed #99D8D2}
.marker .glyph.wash{background:transparent;border:1px dotted #99D8D2;color:#0F766E}
.wh[data-theme="dark"] .marker{background:var(--surface);border-color:#4FD1C5}
.wh[data-theme="dark"] .marker .glyph.wash{border-color:#4FD1C5;color:#67E8DF}

/* ═════════════════════════════════════════════════════════════════════════
   Dark mode — one attribute flips the whole console.
   Same structure, same hierarchy; only the semantic tokens change. Anything
   that must stay a "solid dark chip" regardless of theme (logo mark, toast,
   stage badges, count pills) already uses --onyx, which doesn't move here.
   ═════════════════════════════════════════════════════════════════════════ */
.wh[data-theme="dark"]{
  --paper:#0B0F17;
  --surface:#11161F;
  --sand:#171D28;
  --line:#232B38;
  --line-2:#3A4454;
  --ink:#EDEFF3;
  --ink-2:#A6AFBD;
  --ink-3:#778394;
  --pickup:#6EA1FF;
  --return:#F0A257;
  --wash:#4FD1C5;
  --red:#F97066;
  --red-d:#FDA29B;
  --amber:#FDB022;
  --gold:#6EA1FF;
  --brand:#5B8DEF;
  --brand-strong:#8AB4FF;
  --brand-soft:#152238;
  --green:#3CCB7F;
  --green-soft:#0F2A1D;
  --red-soft:#2A1315;
  --amber-soft:#2A1F0B;
  --teal-soft:#0E2624;
  --return-soft:#2A1B0D;
  --return-border:rgba(240,162,87,.4);
  --red-border:rgba(249,112,102,.45);
  --red-border-soft:rgba(249,112,102,.28);
  --amber-border:rgba(253,176,34,.4);
  --amber-line:#FDB022;
  --teal-border:rgba(79,209,197,.4);
  --brand-border:rgba(91,141,239,.45);
  --brand-line:rgba(91,141,239,.6);
  --onyx:#1B2434;
  --onyx-ink:#F5F7FA;
  --scrim:rgba(2,4,8,.66);
  --skel-a:#161C27; --skel-b:#1E2633;
  --shadow-1:0 1px 2px rgba(0,0,0,.5),0 2px 6px rgba(0,0,0,.35);
  --shadow-2:0 8px 24px rgba(0,0,0,.5),0 2px 8px rgba(0,0,0,.4);
  --shadow-3:0 24px 64px rgba(0,0,0,.6),0 4px 20px rgba(0,0,0,.45);
  --color-scheme:dark;
}
.wh[data-theme="dark"] .top{background:rgba(11,15,23,.86)}
.wh[data-theme="dark"] .m-top{background:rgba(11,15,23,.9)}
.wh[data-theme="dark"] .btn-new{box-shadow:0 1px 2px rgba(0,0,0,.4)}
.wh[data-theme="dark"] .row{background:var(--surface)}
.wh[data-theme="dark"] .row:hover{border-color:var(--line-2)}
.wh[data-theme="dark"] .sheet{border:1px solid rgba(255,255,255,.06)}
.wh[data-theme="dark"] .inp{background:var(--surface);border-color:var(--line-2);color:var(--ink)}
.wh[data-theme="dark"] .inp:focus{box-shadow:0 0 0 3px rgba(91,141,239,.22)}
.wh[data-theme="dark"] .tg button[aria-pressed=true],
.wh[data-theme="dark"] .pay button[aria-checked=true]{color:#0B0F17}
.wh[data-theme="dark"] .day-status{background:var(--green-soft);color:var(--green)}
.wh[data-theme="dark"] .stat,.wh[data-theme="dark"] .rail-card{background:var(--surface)}
.theme-toggle{position:relative;overflow:hidden}
.theme-toggle svg{transition:transform .3s ease,opacity .3s ease}
.booking-steps span:not(:last-child)::after{display:none!important}
.inventory-screen{padding:20px;background:rgba(11,15,23,.68)}
.inventory-screen-shell{width:min(1360px,100%);max-height:calc(100vh - 40px);overflow:auto;border:1px solid var(--line-2);border-radius:16px;background:var(--paper);box-shadow:0 30px 100px rgba(0,0,0,.35)}
.inventory-screen-hero{grid-template-columns:1fr;min-height:154px}.inventory-screen-hero>div:first-child{padding:28px 42px}.inventory-screen-hero h1{font-size:clamp(28px,3.5vw,48px)}.inventory-screen-hero p{font-size:13px}.inventory-hero-art{display:none}.inventory-screen-body{padding:28px 42px 44px}
@media (max-width:819px){
  .sheet.center.sheet-wide{width:100%}
  .sheet.bottom .booking-pane{gap:12px}
  .sheet.bottom .booking-grid.two{grid-template-columns:1fr}
  .sheet.bottom .booking-tabs{margin-right:-4px}
  .sheet.bottom .booking-window span{width:100%;margin-left:22px}
  .sheet.bottom .review-head{display:grid}
  .sheet.bottom .review-head>span{text-align:left}
  .sheet.bottom .booking-steps span{font-size:10px}
  .sheet.bottom .booking-steps{margin-bottom:12px}
  .sheet.bottom .booking-steps span{gap:4px}
  .sheet.bottom .booking-steps span:not(:last-child)::after{left:calc(50% + 18px);right:calc(-50% + 18px)}
  .sheet.bottom .booking-steps i{font-size:10px}
  .sheet.bottom .inventory-layout{grid-template-columns:1fr;gap:12px}
  .sheet.bottom .inventory-context{display:grid;gap:8px}
  .sheet.bottom .inventory-context>span{white-space:normal}
  .sheet.bottom .selection-tray{position:static;order:0;box-shadow:none}
  .sheet.bottom .selection-empty{grid-template-columns:auto 1fr;text-align:left;justify-items:start;padding:14px 10px}
  .sheet.bottom .selection-empty svg{grid-row:span 2}
  .sheet.bottom .selection-lines{max-height:180px}
  .inventory-screen-head{grid-template-columns:1fr auto;gap:8px;padding:0 14px}
  .inventory-screen-head>div{justify-items:start;grid-column:1}
  .inventory-screen-head .x{grid-column:2;grid-row:1}
  .inventory-screen-head .inventory-back{font-size:0;border:0;padding:0;width:44px;justify-content:center}
  .inventory-screen-head .inventory-back svg{width:20px;height:20px}
  .inventory-screen{padding:0;background:var(--paper)}
  .inventory-screen-shell{max-height:none;border:0;border-radius:0;box-shadow:none}
  .inventory-screen-hero{grid-template-columns:1fr;min-height:0}
  .inventory-screen-hero>div:first-child{padding:30px 20px 24px}
  .inventory-screen-hero h1{font-size:34px}
  .inventory-hero-art{min-height:150px}
  .inventory-screen-body{grid-template-columns:1fr;gap:18px;padding:22px 16px 100px}
  .inventory-catalog-head{display:grid;gap:10px;align-items:start}
  .inventory-date-chip{justify-self:start}
  .inventory-screen-grid{grid-template-columns:1fr}
  .inventory-selection{position:static;order:2}
  .inventory-selection-lines{max-height:220px}
}
`;

/* ───────────── icons ───────────── */
const ICONS = {
  House, CalendarDays, Shirt, UsersRound, Menu, Plus, Search, WifiOff, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownLeft, Droplet, Check, TriangleAlert, Phone, Clock, X, Lock, Minus, Info, RotateCw, ShieldCheck,
  Hourglass, CalendarClock, Flag, Settings, ChartNoAxesCombined, MessageCircle, Scissors, Sun, Moon
};

// Selected from Supericons' verified Tabler outline set. Keeping these as
// inline SVGs preserves the no-new-dependency constraint while giving the
// navigation and status surfaces a tighter, more deliberate icon language.
const SUPERICON_SVGS = {
  House: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1"/><path d="M5 16h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1"/><path d="M15 12h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1"/><path d="M15 4h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1"/></svg>',
  CalendarDays: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h16"/><path d="M11 15h1"/><path d="M12 15v3"/></svg>',
  Shirt: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 4l6 2v5h-3v8a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-8h-3v-5l6 -2a3 3 0 0 0 6 0"/></svg>',
  ShieldCheck: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06"/><path d="M15 19l2 2l4 -4"/></svg>',
  Search: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 10a7 7 0 1 0 14 0a7 7 0 0 0 -14 0"/><path d="M21 21l-6 -6"/></svg>',
  Plus: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  Check: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M9 12l2 2l4 -4"/></svg>',
  TriangleAlert: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0"/><path d="M12 16h.01"/></svg>',
  Moon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008"/></svg>',
};

function Icon({ n, size = 18, sw = 2 }) {
  const superSvg = SUPERICON_SVGS[n];
  if (superSvg) {
    const svg = superSvg.replace(/width="24"/g, 'width="100%"').replace(/height="24"/g, 'height="100%"');
    return <span className="supericon" style={{ width: size, height: size, display: 'inline-flex', flex: '0 0 auto' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
  }
  const node = ICONS[n];
  if (!node) return null;
  if (typeof node === 'function' || (typeof node === 'object' && node && node.$$typeof)) {
    const Component = node;
    return <Component size={size} strokeWidth={sw} aria-hidden="true" />;
  }
  if (Array.isArray(node)) {
    const elements = Array.isArray(node[0]) ? node : (node[2] || []);
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {elements.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
      </svg>
    );
  }
  return null;
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
function EventRow({ ev, focus, expanded, late, lateMin, locked, mobile, showMoney, onToggle, onAct, onTime, onOpen, onAltReady }) {
  const T = TYPE[ev.type];
  const sN = shortN(ev);
  const alt = altPending(ev);
  const money = showMoney ? moneyLine(ev) : null;
  const actBtn = (
    <ActBtn type={ev.type} locked={locked} solid={mobile || focus} onClick={() => onAct(ev)}
      disabled={alt && !locked} title={alt ? 'Alterations not ready yet' : undefined} />
  );
  return (
    <li className={cx('row', ev.type, focus && 'focused', expanded && 'is-open')}>
      <div className="row-line">
        <button className="row-hit" onClick={() => onToggle(ev.id)} aria-expanded={expanded}>
          <span className={cx('glyph', ev.type)}><Icon n={T.icon} size={mobile ? 20 : 21} sw={2.4} /></span>
          <span className="row-text">
            <span className="row-name">
              <b>{ev.name}</b><span className="bid">#{ev.bid}</span>
              {late && <span className="flag late"><Icon n="Clock" size={12} sw={2.6} />{inMin(lateMin)} late</span>}
              {sN > 0 && <span className="flag wash"><Icon n="Droplet" size={12} sw={2.6} />{sN} in wash</span>}
              {alt && <span className="chip-alt"><Icon n="Scissors" size={12} sw={2.4} />Alterations pending</span>}
            </span>
            <span className="row-sub"><span className="kind">{T.label}</span>{lineText(ev.lines)}</span>
          </span>
          {mobile && <span className="chev"><Icon n="ChevronDown" size={18} /></span>}
        </button>
        {!mobile && <div className="row-action">{actBtn}</div>}
      </div>
      {expanded && (
          <div className="row-more row-more-enter" style={{ overflow: 'hidden' }}>
            <div className="row-more-inner">
              {ev.party && (
                <div>
                  <div className="detail-label">Party</div>
                  <p className="party">{ev.party}</p>
                </div>
              )}
              <div>
                <div className="detail-label">Rental pieces</div>
                <ul className="chips">
                  {ev.lines.map((l) => <li key={l.id} className={l.onRack !== undefined && l.onRack < l.qty ? 'short' : undefined}>{l.name} <b>×{l.qty}</b>{l.onRack !== undefined && l.onRack < l.qty && ` · ${l.onRack} on rack`}</li>)}
                </ul>
              </div>
              {money && <p className="money">{money}</p>}
              <div className="more-actions">
                <a className="link" href={telHref(ev.phone)}><Icon n="Phone" size={14} />Call {ev.phone}</a>
                <a className="iconlink" href={waHref(ev.phone)} target="_blank" rel="noopener noreferrer"
                  aria-label={`WhatsApp ${ev.name}`} title="Open WhatsApp"><Icon n="MessageCircle" size={17} /></a>
                <button className="link" onClick={() => onTime(ev)}><Icon n="CalendarClock" size={14} />Change time</button>
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
function Sheet({ mobile, title, sub, onClose, children, summary, foot, wide = false }) {
  useEffect(() => {
    const f = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [onClose]);
  return (
    <div className="scrim scrim-enter" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={cx('sheet', mobile ? 'bottom' : 'center', wide && 'sheet-wide', 'sheet-enter')} role="dialog" aria-modal="true" aria-label={title}>
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
function LinesSheet({ kind, obj, mobile, canViewMoney = true, onClose, onConfirm }) {
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

  const showMoney = canViewMoney && kind === 'pickup' && obj.rentalTotal !== undefined;
  const needsPayment = showMoney && obj.balanceDue > 0;
  const canCollectDeposit = canViewMoney;
  const depositRupees = depositOn ? Math.max(0, Number(depositAmt) || 0) : 0;
  const deposit = kind === 'return' ? obj.depositHeld || 0 : 0;
  const rentBal = kind === 'return' ? obj.rentalBalance || 0 : 0;
  const showRefund = canViewMoney && kind === 'return' && deposit > 0;
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
      {canCollectDeposit && <label className="depchk">
        <input type="checkbox" checked={depositOn} onChange={(e) => setDepositOn(e.target.checked)} />
        Also take a security deposit
      </label>}
      {canCollectDeposit && depositOn && (
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

const bookingDate = (offset = 0) => {
  const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const bookingDateLabel = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Choose a date';
const BOOKING_CATEGORIES = [
  { id: 'suits', label: 'Suits' }, { id: 'sherwanis', label: 'Sherwanis' }, { id: 'jodhpuri', label: 'Jodhpuri' },
  { id: 'accessories', label: 'Accessories' }, { id: 'groomsmen', label: 'Groomsmen' },
];
const BOOKING_IMAGES = {
  suits: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=82',
  sherwanis: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=1200&q=82',
  jodhpuri: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=1200&q=82',
  accessories: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=82',
  groomsmen: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=82',
};
const BOOKING_STOCK = [
  { id: 'bs1', category: 'suits', name: 'Suit · Navy', detail: 'Classic two-piece · regular fit', price: 3500, stock: 4, blocked: [{ start: bookingDate(14), end: bookingDate(14), reason: 'reserved for a wedding' }] },
  { id: 'bs2', category: 'suits', name: 'Suit · Charcoal', detail: 'Two-piece · slim fit', price: 3800, stock: 3, blocked: [] },
  { id: 'sh1', category: 'sherwanis', name: 'Sherwani · Ivory', detail: 'Embroidered collar · sizes 38–44', price: 6000, stock: 3, blocked: [{ start: bookingDate(18), end: bookingDate(20), reason: 'out for another booking' }] },
  { id: 'sh2', category: 'sherwanis', name: 'Sherwani · Maroon', detail: 'Textured jacquard · sizes 38–44', price: 6500, stock: 2, blocked: [] },
  { id: 'jo1', category: 'jodhpuri', name: 'Jodhpuri · Navy', detail: 'Bandhgala · matching trouser', price: 4800, stock: 2, blocked: [] },
  { id: 'ac1', category: 'accessories', name: 'Bow tie · Black', detail: 'Adjustable satin bow tie', price: 450, stock: 8, blocked: [] },
  { id: 'ac2', category: 'accessories', name: 'Formal shoes · Black', detail: 'Polished leather · sizes 7–11', price: 900, stock: 6, blocked: [] },
  { id: 'ac3', category: 'accessories', name: 'Stole · Gold', detail: 'Silk finish · one size', price: 700, stock: 5, blocked: [] },
  { id: 'gm1', category: 'groomsmen', sub: 'Suits', name: 'Groomsmen suit · Navy', detail: 'Group rate · per person', price: 2600, stock: 7, blocked: [] },
  { id: 'gm2', category: 'groomsmen', sub: 'Waistcoats', name: 'Groomsmen waistcoat · Silver', detail: 'Adjustable back · per person', price: 850, stock: 8, blocked: [] },
  { id: 'gm3', category: 'groomsmen', sub: 'Accessories', name: 'Groomsmen tie set', detail: 'Matching set · per person', price: 350, stock: 10, blocked: [] },
];

function InventoryScreen({ mobile, draft, canViewMoney, onClose, onDone }) {
  const [category, setCategory] = useState('suits');
  const [sub, setSub] = useState('All');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(() => (draft.items || []).reduce((acc, item) => ({ ...acc, [item.id]: item }), {}));
  const chosen = Object.values(selected);
  const displayed = BOOKING_STOCK.filter((item) => item.category === category && (category !== 'groomsmen' || sub === 'All' || item.sub === sub));
  const money = (rupees) => inr(R(rupees));
  const available = (item, qty, itemStart = draft.start, itemEnd = draft.end) => {
    const blocked = item.blocked.find((b) => itemStart <= b.end && itemEnd >= b.start);
    return blocked ? { ok: false, reason: `${blocked.reason} on ${bookingDateLabel(blocked.start)}` } : { ok: qty <= item.stock, reason: qty > item.stock ? `Only ${item.stock} available` : '' };
  };
  const update = (item, patch) => setSelected((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || { ...item, qty: 0, sameAsMain: true, start: draft.start, end: draft.end }), ...patch } }));
  const add = (item) => { const current = selected[item.id]; const qty = (current?.qty || 0) + 1; const result = available(item, qty, current?.sameAsMain === false ? current.start : draft.start, current?.sameAsMain === false ? current.end : draft.end); if (!result.ok) { setError(`${item.name}: ${result.reason}`); return; } setError(''); update(item, { qty }); };
  const remove = (item) => { const current = selected[item.id]; if (!current) return; if (current.qty <= 1) setSelected(({ [item.id]: _, ...rest }) => rest); else update(item, { qty: current.qty - 1 }); };
  return <div className={cx('inventory-screen', mobile && 'inventory-screen-mobile')} role="dialog" aria-modal="true" aria-label="Choose inventory"><div className="inventory-screen-shell">
    <header className="inventory-screen-head"><button className="inventory-back" onClick={onClose}><Icon n="ArrowDownLeft" size={18} />Back to booking</button><div><b>Choose inventory</b><span>{bookingDateLabel(draft.start)} → {bookingDateLabel(draft.end)}{draft.dynamic ? ' · Item dates enabled' : ''}</span></div><button className="x" onClick={onClose} aria-label="Close inventory"><Icon n="X" size={20} /></button></header>
    <div className="inventory-screen-hero"><div><span className="overline">Groom wear rental inventory</span><h1>Build the outfit around the event.</h1><p>Pick the pieces, check their date window, and return to the booking with a clean selection.</p></div><div className="inventory-hero-art" role="img" aria-label="Formal groom wear on a clothing rack" /></div>
    <main className="inventory-screen-body"><section className="inventory-catalog"><div className="inventory-catalog-head"><div><h2>Available pieces</h2><p>Cleaning buffer is included before every event date.</p></div><div className="inventory-date-chip"><Icon n="CalendarDays" size={15} />{bookingDateLabel(draft.start)} → {bookingDateLabel(draft.end)}</div></div><div className="inventory-category-rail">{BOOKING_CATEGORIES.map((c) => <button key={c.id} aria-selected={category === c.id} onClick={() => { setCategory(c.id); setSub('All'); }}>{c.label}</button>)}</div>{category === 'groomsmen' && <div className="booking-subtabs">{['All', 'Suits', 'Waistcoats', 'Accessories'].map((s) => <button key={s} aria-pressed={sub === s} onClick={() => setSub(s)}>{s}</button>)}</div>}<div className="inventory-screen-grid">{displayed.map((item) => { const picked = selected[item.id]; const itemStart = picked?.sameAsMain === false ? picked.start : draft.start; const itemEnd = picked?.sameAsMain === false ? picked.end : draft.end; const result = available(item, (picked?.qty || 0) + 1, itemStart, itemEnd); return <article className={cx('inventory-screen-card', picked && 'selected')} key={item.id}><div className="inventory-card-visual" style={{ backgroundImage: `url(${BOOKING_IMAGES[item.category]})` }} /><div className="inventory-screen-card-body"><div><b>{item.name}</b><p>{item.detail}</p>{canViewMoney && <em>{money(item.price)} / rental</em>}</div><span className={result.ok ? 'stock-ok' : 'stock-bad'}>{result.ok ? `${item.stock} in rotation` : `Unavailable · ${result.reason}`}</span><div className="inventory-screen-card-action">{picked ? <Stepper value={picked.qty} max={item.stock} onChange={(v) => v ? update(item, { qty: v }) : remove(item)} /> : <button className="act solid dark" disabled={!result.ok} onClick={() => add(item)}><Icon n="Plus" size={16} />Add to booking</button>}</div>{picked && draft.dynamic && <div className="inventory-item-date"><label className="inline-check"><input type="checkbox" checked={picked.sameAsMain !== false} onChange={(e) => update(item, { sameAsMain: e.target.checked, start: draft.start, end: draft.end })} />Use event dates</label>{picked.sameAsMain === false && <div className="booking-grid two"><input className="inp" type="date" min={bookingDate()} value={picked.start} onChange={(e) => update(item, { start: e.target.value })} /><input className="inp" type="date" min={picked.start} value={picked.end} onChange={(e) => update(item, { end: e.target.value })} /></div>}</div>}</div></article>; })}</div>{error && <div className="note warn"><Icon n="TriangleAlert" size={16} />{error}</div>}</section><aside className="inventory-selection"><div className="inventory-selection-head"><div><h2>Selected for booking</h2><p>{chosen.reduce((s, i) => s + i.qty, 0)} pieces selected</p></div><span>{chosen.length}</span></div>{chosen.length ? <div className="inventory-selection-lines">{chosen.map((item) => <div key={item.id}><span><b>{item.name}</b><small>{item.qty} × {draft.dynamic && item.sameAsMain === false ? `${bookingDateLabel(item.start)} → ${bookingDateLabel(item.end)}` : 'Event dates'}</small></span><button onClick={() => remove(item)} aria-label={`Remove ${item.name}`}><Icon n="X" size={15} /></button></div>)}</div> : <div className="inventory-selection-empty"><Icon n="Shirt" size={30} /><b>No pieces selected</b><p>Start with the main outfit, then add accessories and groomsmen pieces.</p></div>}<button className="inventory-continue" disabled={!chosen.length} onClick={() => onDone(chosen)}>Continue with {chosen.reduce((s, i) => s + i.qty, 0) || 'selected'} pieces<Icon n="ArrowUpRight" size={18} /></button></aside></main>
  </div></div>;
}

function NewSheet({ mobile, onClose, onGo, canViewMoney, initialStep = 1, initialDraft = {}, onOpenInventory, onBackToInventory }) {
  const [step, setStep] = useState(initialStep);
  const [start, setStart] = useState(initialDraft.start || bookingDate(14));
  const [end, setEnd] = useState(initialDraft.end || bookingDate(15));
  const [dynamic, setDynamic] = useState(!!initialDraft.dynamic);
  const [category, setCategory] = useState('suits');
  const [sub, setSub] = useState('All');
  const [selected, setSelected] = useState(() => (initialDraft.items || []).reduce((acc, item) => ({ ...acc, [item.id]: item }), {}));
  const [customer, setCustomer] = useState({ name: '', place: '', whatsapp: '' });
  const [advance, setAdvance] = useState('');
  const [error, setError] = useState('');

  const chosen = Object.values(selected);
  const money = (rupees) => inr(R(rupees));
  const subtotal = chosen.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  const displayed = BOOKING_STOCK.filter((item) => item.category === category && (category !== 'groomsmen' || sub === 'All' || item.sub === sub));
  const available = (item, qty, itemStart = start, itemEnd = end) => {
    const blocked = item.blocked.find((b) => itemStart <= b.end && itemEnd >= b.start);
    return blocked ? { ok: false, reason: `${blocked.reason} for ${bookingDateLabel(blocked.start)}` } : { ok: qty <= item.stock, reason: qty > item.stock ? `Only ${item.stock} available` : '' };
  };
  const updateSelected = (item, patch) => setSelected((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] || { ...item, qty: 0, sameAsMain: true, start, end }), ...patch } }));
  const addItem = (item) => {
    const current = selected[item.id];
    const qty = (current?.qty || 0) + 1;
    const result = available(item, qty, current?.sameAsMain === false ? current.start : start, current?.sameAsMain === false ? current.end : end);
    if (!result.ok) { setError(`${item.name}: ${result.reason}`); return; }
    setError(''); updateSelected(item, { qty });
  };
  const removeItem = (item) => {
    const current = selected[item.id]; if (!current) return;
    if (current.qty <= 1) setSelected(({ [item.id]: _, ...rest }) => rest); else updateSelected(item, { qty: current.qty - 1 });
  };
  const datesOkay = start && end && end >= start;
  const next = () => {
    setError('');
    if (step === 1 && !datesOkay) { setError('Choose an end date on or after the start date.'); return; }
    if (step === 1 && onOpenInventory) { onOpenInventory({ start, end, dynamic }); return; }
    if (step === 2 && !chosen.length) { setError('Pick at least one item to continue.'); return; }
    if (step === 3 && (!customer.name.trim() || !customer.whatsapp.trim())) { setError('Name and WhatsApp number are required.'); return; }
    setStep((s) => Math.min(4, s + 1));
  };
  const back = () => {
    setError('');
    if (step === 3 && onBackToInventory) { onBackToInventory({ start, end, dynamic, items: chosen }); return; }
    setStep((s) => Math.max(1, s - 1));
  };
  const finish = () => {
    if (canViewMoney && (!advance || Number(advance) < 0 || Number(advance) > total)) { setError('Enter an advance between ₹0 and the total.'); return; }
    onGo({ start, end, dynamic, items: chosen, customer, subtotal, gst, total, advance: canViewMoney ? Number(advance || 0) : null });
  };
  const stepTitle = ['Dates', 'Pick items', 'Customer', 'Review'][step - 1];
  return (
    <Sheet mobile={mobile} wide onClose={onClose} title={`New booking · ${stepTitle}`} sub={`Step ${step} of 4 · ${dynamic ? 'Different dates allowed per item' : 'One event window for all items'}`}
      foot={<><button className="act dark" onClick={step === 1 ? onClose : back}>{step === 1 ? 'Cancel' : 'Back'}</button><button className="act solid dark" disabled={step === 2 && !chosen.length} onClick={step === 4 ? finish : next}>{step === 4 ? 'Create booking' : 'Continue'}</button></>}>
      <div className="booking-steps" aria-label="Booking progress">{['Dates', 'Items', 'Customer', 'Review'].map((label, i) => <span key={label} className={cx(i + 1 === step && 'on', i + 1 < step && 'done')}><b>{i + 1}</b><i>{label}</i></span>)}</div>
      {step === 1 && <div className="booking-pane">
        <div className="booking-grid two"><label><span>Event starts</span><input className="inp" type="date" min={bookingDate()} value={start} onChange={(e) => { setStart(e.target.value); if (end < e.target.value) setEnd(e.target.value); }} /></label><label><span>Event ends</span><input className="inp" type="date" min={start || bookingDate()} value={end} onChange={(e) => setEnd(e.target.value)} /></label></div>
        <div className="date-summary"><Icon n="CalendarDays" size={20} /><div><b>{bookingDateLabel(start)} → {bookingDateLabel(end)}</b><small>{datesOkay ? 'This window reserves each selected piece with its prep buffer.' : 'Choose a valid date range.'}</small></div></div>
        <label className="booking-check"><input type="checkbox" checked={dynamic} onChange={(e) => setDynamic(e.target.checked)} /><span><b>Different dates for individual items</b><small>Use this when the suit, groom’s outfit, or accessories are needed for different days.</small></span></label>
        {!dynamic && <div className="note"><Icon n="Info" size={16} />All items will use the same event dates. You can turn on individual dates before selecting items.</div>}
      </div>}
      {step === 2 && <div className="booking-pane">
        <div className="inventory-layout">
          <div className="inventory-main">
            <div className="inventory-context"><div><b>Choose what the groom and party need</b><small>Availability includes the one-day cleaning buffer before each event date.</small></div><span><Icon n="CalendarDays" size={15} />{bookingDateLabel(start)} → {bookingDateLabel(end)}</span></div>
            <div className="booking-tabs" role="tablist">{BOOKING_CATEGORIES.map((c) => <button key={c.id} role="tab" aria-selected={category === c.id} onClick={() => { setCategory(c.id); setSub('All'); }}>{c.label}</button>)}</div>
            {category === 'groomsmen' && <div className="booking-subtabs">{['All', 'Suits', 'Waistcoats', 'Accessories'].map((s) => <button key={s} aria-pressed={sub === s} onClick={() => setSub(s)}>{s}</button>)}</div>}
            <div className="inventory-list">{displayed.map((item) => { const picked = selected[item.id]; const itemStart = picked?.sameAsMain === false ? picked.start : start; const itemEnd = picked?.sameAsMain === false ? picked.end : end; const result = available(item, (picked?.qty || 0) + 1, itemStart, itemEnd); return <article className={cx('inventory-card', picked && 'selected')} key={item.id}><div><b>{item.name}</b><small>{item.detail}</small>{canViewMoney && <em>{money(item.price)} / rental</em>}{result.ok ? <small className="stock-ok">{item.stock} pieces in rotation</small> : <small className="stock-bad">Unavailable · {result.reason}</small>}</div><div className="inventory-actions">{picked && <Stepper value={picked.qty} max={item.stock} onChange={(v) => v ? updateSelected(item, { qty: v }) : removeItem(item)} />}{!picked && <button className="act solid dark" disabled={!available(item, 1).ok} onClick={() => addItem(item)}><Icon n="Plus" size={16} />Pick</button>}</div>{picked && dynamic && <div className="item-dates"><label className="inline-check"><input type="checkbox" checked={picked.sameAsMain !== false} onChange={(e) => updateSelected(item, { sameAsMain: e.target.checked, start, end })} />Use event dates</label>{picked.sameAsMain === false && <div className="booking-grid two"><input className="inp" type="date" min={bookingDate()} value={picked.start} onChange={(e) => updateSelected(item, { start: e.target.value })} /><input className="inp" type="date" min={picked.start} value={picked.end} onChange={(e) => updateSelected(item, { end: e.target.value })} /></div>}</div>}</article>; })}</div>
          </div>
          <aside className="selection-tray"><div className="selection-tray-head"><div><b>Selected items</b><small>{chosen.reduce((s, i) => s + i.qty, 0)} pieces · ready to review</small></div><span>{chosen.length}</span></div>{chosen.length ? <div className="selection-lines">{chosen.map((i) => <div key={i.id}><span><b>{i.name}</b><small>{i.qty} × {dynamic && i.sameAsMain === false ? `${bookingDateLabel(i.start)} → ${bookingDateLabel(i.end)}` : 'Event dates'}</small></span><button onClick={() => removeItem(i)} aria-label={`Remove ${i.name}`}><Icon n="X" size={15} /></button></div>)}</div> : <div className="selection-empty"><Icon n="Shirt" size={24} /><p>Your picks will appear here.</p><small>Choose suits, sherwanis, accessories, or groomsmen pieces.</small></div>}{chosen.length > 0 && <div className="selection-total"><span>Items selected</span><b>{chosen.reduce((s, i) => s + i.qty, 0)}</b></div>}</aside>
        </div>
      </div>}
      {step === 3 && <div className="booking-pane"><div className="customer-intro"><Icon n="UsersRound" size={22} /><div><b>Who is this booking for?</b><small>Use the number staff will message on WhatsApp.</small></div></div><label><span>Customer name</span><input className="inp" autoFocus value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="e.g. Faisal Rahman" /></label><label><span>WhatsApp number</span><input className="inp" inputMode="tel" value={customer.whatsapp} onChange={(e) => setCustomer({ ...customer, whatsapp: e.target.value })} placeholder="e.g. 98470 90311" /></label><label><span>Place</span><input className="inp" value={customer.place} onChange={(e) => setCustomer({ ...customer, place: e.target.value })} placeholder="e.g. Kozhikode" /></label></div>}
      {step === 4 && <div className="booking-pane"><div className="review-head"><div><b>{customer.name}</b><small>{customer.place || 'Place not added'} · {customer.whatsapp}</small></div><span>{bookingDateLabel(start)} → {bookingDateLabel(end)}</span></div><div className="review-lines">{chosen.map((item) => <div key={item.id}><span>{item.name} ×{item.qty}<small>{dynamic && item.sameAsMain === false ? `${bookingDateLabel(item.start)} → ${bookingDateLabel(item.end)}` : 'Event dates'}</small></span>{canViewMoney && <b>{money(item.price * item.qty)}</b>}</div>)}</div>{canViewMoney ? <div className="bill"><SumRow label="Rental subtotal" value={money(subtotal)} /><SumRow label="GST · 18%" value={money(gst)} /><SumRow total label="Total" value={money(total)} /><label><span>Advance customer is paying now</span><input className="inp" type="number" min="0" max={total} inputMode="numeric" placeholder="Enter agreed amount" value={advance} onChange={(e) => setAdvance(e.target.value)} /></label>{advance && <div className="balance-line">Balance after advance <b>{money(Math.max(0, total - Number(advance || 0)))}</b></div>}</div> : <div className="note"><Icon n="Lock" size={16} />Pricing and payment are hidden for Staff. A manager can complete the bill from the booking record.</div>}</div>}
      {error && <div className="note warn"><Icon n="TriangleAlert" size={16} />{error}</div>}
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

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('wh-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* no-op */ }
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const toggleTheme = () => setTheme((t) => {
    const nt = t === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('wh-theme', nt); } catch { /* no-op */ }
    return nt;
  });
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)');

  const isToday = dayOff === 0;
  const failed = errored && !loading;

  /* fonts (skip if your app already loads them) */
  useEffect(() => {
    if (document.getElementById('wh-fonts')) return;
    const l = document.createElement('link');
    l.id = 'wh-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap';
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

  /* Completion feedback stays quiet and reversible for a frequently used console. */
  const celebrate = () => { if (!reducedMotion) info('Booking complete.'); };

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
  const scrollBand = () => bandRef.current && bandRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  const confirmLines = (kind, src, obj, picks, flags, paid, depositCollected, canHandleMoney) => {
    const total = obj.lines.reduce((s, l) => s + (picks[l.id] || 0), 0);
    const flagged = obj.lines.filter((l) => (picks[l.id] || 0) > 0 && l.id in flags);
    const rest = applyPicks(obj.lines, picks);
    const collected = canHandleMoney && kind === 'pickup' && obj.balanceDue > 0 ? obj.balanceDue : 0;
    const deposit = canHandleMoney && kind === 'return' ? obj.depositHeld || 0 : 0;
    const review = flagged.length > 0 || !!obj.damageFlag;
    const refund = canHandleMoney && kind === 'return' && rest.length === 0 && !review ? Math.max(0, deposit - (obj.rentalBalance || 0)) : 0;
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
    const ok = run((d) => {
      let { events, overdue, pool, defects } = d;
      const patch = (o) => ({
        ...o, lines: rest,
        ...(canHandleMoney && kind === 'pickup' && collected ? { balanceDue: 0, collectedVia: paid } : {}),
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
    if (ok && rest.length === 0) celebrate();
    return ok;
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
        return {
          ...e, lines: e.lines.map((l) => {
            const w = washed.find((x) => x.name === l.name);
            if (!w || l.onRack === undefined) return l;
            const on = Math.min(l.qty, l.onRack + w.qty);
            const { onRack, ...restL } = l;
            return on >= l.qty ? restL : { ...l, onRack: on };
          })
        };
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
                  <Icon n={offline ? 'Lock' : 'ArrowDownLeft'} size={17} sw={2.4} /><span className="lbl">Take back</span>
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

  const renderDayHead = () => {
    const open = pend.filter((e) => e.type !== 'wash').length;
    const complete = done.filter((e) => e.type !== 'wash').length;
    const pickups = pend.filter((e) => e.type === 'pickup').length;
    const returns = pend.filter((e) => e.type === 'return').length;
    const washes = pend.filter((e) => e.type === 'wash').length;
    return (
      <div className="dayhead">
        <div className="dayhead-top">
          <div className="daycopy">
            <div className="overline">{relDay(dayOff)}</div>
            <div className="day-title-row">
              <h1>{longDay(dayOff)}</h1>
              <span className="day-status">{isToday ? 'Live schedule' : 'Planned day'}</span>
            </div>
            <p className="day-sub">{open ? `${open} open counter ${plur(open, 'task', 'tasks')}` : 'No open counter tasks'}{washes ? ` · ${washes} laundry ${plur(washes, 'item', 'items')} in the timeline` : ''}</p>
          </div>
          <div className="daynav">
            {!isToday && <button className="textbtn" onClick={() => setDayOff(0)}>Back to today</button>}
            <button className="iconbtn" onClick={() => shift(-1)} aria-label="Previous day"><Icon n="ChevronLeft" size={19} /></button>
            <button className="iconbtn" onClick={() => shift(1)} aria-label="Next day"><Icon n="ChevronRight" size={19} /></button>
          </div>
        </div>
        <div className="daystats" aria-label="Daily operational summary">
          <div className="stat"><div className="stat-label">Open</div><div className="stat-value">{open}</div><div className="stat-note">counter tasks</div></div>
          <div className="stat"><div className="stat-label">Completed</div><div className="stat-value">{complete}</div><div className="stat-note">{isToday ? 'earlier today' : 'already recorded'}</div></div>
          <div className="stat"><div className="stat-label">Pickups</div><div className="stat-value">{pickups}</div><div className="stat-note">awaiting handover</div></div>
          <div className="stat"><div className="stat-label">Returns</div><div className="stat-value">{returns}</div><div className="stat-note">awaiting return</div></div>
        </div>
      </div>
    );
  };

  const renderRow = (e) => {
    if (e.type === 'wash') {
      return <WashMarker key={e.id} ev={e} late={isToday && e.time < now} lateMin={now - e.time} onLaundry={goLaundry} />;
    }
    const isFocus = !!focus && focus.id === e.id;
    const expanded = isFocus ? !toggled.has(e.id) : toggled.has(e.id);
    return (
      <EventRow key={e.id} ev={e} focus={isFocus} expanded={expanded} late={isToday && e.time < now} lateMin={now - e.time}
        locked={offline || !isToday} mobile={mobile} showMoney={role !== 'staff'} onToggle={toggle} onAct={act}
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
    if (failed) return <section ref={laundryRef} className="rail-card laundry-card"><h2><span className="rail-icon"><Icon n="Droplet" size={17} sw={2.4} /></span><span>Laundry</span><span className="rail-count">—</span></h2><div className="note warn"><Icon n="Info" size={16} />Couldn’t load. Don’t assume nothing is waiting.</div></section>;
    if (loading) return <section className="rail-card laundry-card"><h2><span className="rail-icon"><Icon n="Droplet" size={17} sw={2.4} /></span><span>Laundry</span></h2><div className="skel"><i /></div></section>;
    const { pool, batches, rack } = data;
    return (
      <section ref={laundryRef} className="rail-card laundry-card" aria-label="Laundry">
        <h2><span className="rail-icon"><Icon n="Droplet" size={17} sw={2.4} /></span><span>Laundry</span><span className="rail-count">{pool.length + batches.length}</span></h2>
        <p className="rule"><Icon n="Lock" size={14} />A garment can’t go back on the rack until you mark it washed.</p>
        <div className="pipe">
          <div className="stage">
            <span className="stage-n">1</span>
            <div>
              <h3>Returned, not in a wash yet</h3>
              {pool.length ? (
                <>
                  <ul className="plain">{pool.map((p) => <li key={p.id}><b>{p.name} ×{p.qty}</b><span>{p.flag && 'Flagged · '}{p.from} · {p.at}</span></li>)}</ul>
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
    <section className="rail-card desk-card desk" aria-label="Needs a manager">
      <h2><span className="rail-icon"><Icon n="ShieldCheck" size={17} sw={2.4} /></span><span>Needs a manager</span><span className="rail-count">{data.defects.length}</span></h2>
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

  const toastEl = () => (
    <>
      {toast && (
        <div key={`${toast.tone}-${toast.msg || 'offline'}`} className={cx('toast', toast.tone === 'offline' && 'offline', 'toast-enter')} role="status">
          {toast.tone === 'offline' ? (
            <>
              <Icon n="WifiOff" size={22} />
              <div><b>You’re offline — nothing was changed</b><span>Hand over, take back, wash and time changes are paused until you reconnect.</span></div>
            </>
          ) : (
            <>
              <span>{toast.msg}</span>
              {toast.undo && <button onClick={() => { toast.undo(); notify({ tone: 'info', msg: 'Undone.' }); }}>Undo</button>}
            </>
          )}
        </div>
      )}
    </>
  );

  const renderSheet = () => {
    if (!sheet) return null;
    const close = () => setSheet(null);
    const k = sheet.kind;
    if (k === 'pickup' || k === 'return') {
      const obj = sheet.src === 'overdue' ? data.overdue.find((o) => o.id === sheet.id) : data.events.find((e) => e.id === sheet.id);
      if (!obj) return null;
      return <LinesSheet key={sheet.id} kind={k} obj={obj} mobile={mobile} onClose={close}
        canViewMoney={role !== 'staff'}
        onConfirm={(picks, flags, paid, depositCollected) => { if (confirmLines(k, sheet.src, obj, picks, flags, paid, role !== 'staff' ? depositCollected : 0, role !== 'staff')) close(); }} />;
    }
    if (k === 'sendWash') {
      return <CheckSheet mobile={mobile} onClose={close} title="Send to wash" verb="Send"
        sub="Pick what goes in this wash. It becomes one batch — not tracked per garment."
        items={data.pool.map((p) => ({ id: p.id, name: p.name, qty: p.qty, sub: `${p.flag ? 'Flagged · ' : ''}from ${p.from}, ${p.at}` }))}
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
    if (k === 'inventory') return <InventoryScreen mobile={mobile} draft={sheet.draft} canViewMoney onClose={() => setSheet({ kind: 'new', initialStep: 1, draft: sheet.draft })} onDone={(items) => setSheet({ kind: 'new', initialStep: 3, draft: { ...sheet.draft, items } })} />;
    if (k === 'new') return <NewSheet mobile={mobile} canViewMoney initialStep={sheet.initialStep || 1} initialDraft={sheet.draft || {}} onClose={close} onOpenInventory={(draft) => setSheet({ kind: 'inventory', draft })} onBackToInventory={(draft) => setSheet({ kind: 'inventory', draft })} onGo={(booking) => {
      const bid = Math.max(1065, ...data.events.map((e) => Number(e.bid) || 0)) + 1;
      const ok = run((d) => ({
        ...d,
        events: [...d.events, {
          id: uid(), day: 0, type: 'pickup', time: 600, name: booking.customer.name, phone: booking.customer.whatsapp, bid,
          party: booking.items.some((i) => i.category === 'groomsmen') ? 'Groom + groomsmen' : undefined,
          lines: booking.items.map((i) => ({ id: i.id, name: i.name, qty: i.qty })), status: 'pending',
          rentalTotal: R(booking.total), advancePaid: R(booking.advance || 0), balanceDue: R(Math.max(0, booking.total - (booking.advance || 0))),
        }],
      }), `Booking #${bid} created`);
      if (ok) close();
    }} />;
    return null;
  };

  const nav = (label) => info(`${label} is its own screen — not part of Home.`);

  const themeToggle = (size = 20) => (
    <button className="iconbtn theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
      <span key={theme} style={{ display: 'grid', placeItems: 'center' }}>
          <Icon n={theme === 'dark' ? 'Sun' : 'Moon'} size={size} />
      </span>
      <span className="top-action-label">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );

  const renderQuickBooking = () => (
    <section className="quick-booking" aria-label="New booking">
      <div className="quick-booking-icon"><Icon n="Plus" size={18} sw={2.6} /></div>
      <div className="quick-booking-copy">
        <h2>New booking</h2>
        <p>Check dates and stock in one step.</p>
      </div>
      <button className={cx('quick-booking-action', offline && 'locked')} onClick={openNew}>
        <Icon n={offline ? 'Lock' : 'ArrowUpRight'} size={17} sw={2.4} />Open
      </button>
    </section>
  );

  /* ───── mobile composition ───── */
  if (mobile) {
    return (
      <div className="wh mobile" data-theme={theme}>
        <style>{CSS}</style>
        <header className="m-top">
          <div className="m-top-copy">
            <div className="m-brand"><b>WedHub</b> · Operations</div>
            <div className="m-date"><span className="overline">{relDay(dayOff)}</span><h1>{shortDay(dayOff)}</h1></div>
          </div>
          <div className="m-tools">
            {alertChip()}{offlineChip()}
            {themeToggle(22)}
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
          <div key={`${tab}-${dayOff}`} className="view-enter">
              {tab === 'schedule' ? renderSchedule() : <div className="side">{renderLaundry()}{role !== 'staff' && !failed && renderDesk()}</div>}
          </div>
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
  const navItems = [
    ['Home', true, 'House'],
    ['Bookings', false, 'CalendarDays'],
    ['Inventory', false, 'Shirt'],
    ['Customers', false, 'UsersRound'],
    ...(role === 'owner' ? [['Reports', false, 'ChartNoAxesCombined'], ['Settings', false, 'Settings']] : []),
  ];
  return (
    <div className="wh" data-theme={theme}>
      <style>{CSS}</style>
      <header className="top">
        <div className="brand"><span className="mark">W</span><span className="brand-lockup"><span className="brand-name">WedHub</span><span className="brand-context">Operations</span><span className="brand-date">{shortDay(dayOff)}</span></span></div>
        <nav className="nav" aria-label="Main">
          {navItems.map(([label, on, icon]) => <button key={label} className={on ? 'on' : undefined} onClick={() => !on && nav(label)}><Icon n={icon} size={16} sw={2.2} /><span>{label}</span></button>)}
        </nav>
        <span className="sp" />
        {alertChip()}{offlineChip()}
        {themeToggle(20)}
        <button className="iconbtn top-tool" onClick={() => setSheet({ kind: 'search' })} aria-label="Find a booking (press /)"><Icon n="Search" size={20} /><span className="top-action-label">Search</span></button>
        <button className={cx('btn-new', offline && 'locked')} onClick={openNew}>
          <Icon n={offline ? 'Lock' : 'Plus'} size={20} sw={2.6} />New booking<kbd>N</kbd>
        </button>
        <span className="avatar" title={`${me.name} · ${me.title}`}>{me.ini}</span>
      </header>
      {banner()}
      <main className="page">
        <div className="main-col view-enter" key={dayOff}>
            {renderDayHead()}{renderOverdue()}{renderSchedule()}
        </div>
        <aside className="side">{renderQuickBooking()}{renderLaundry()}{role !== 'staff' && !failed && renderDesk()}</aside>
      </main>
      {toastEl()}
      {renderSheet()}
    </div>
  );
}
