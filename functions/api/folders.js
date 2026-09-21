export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const db = env.DB;
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    if (!url.pathname.startsWith('/api/')) {
      // Serve frontend from index.html asset if you use Workers Assets, otherwise return index.html via fetch
      // For simplest Worker-only: paste your index.html content here or use env.ASSETS
      return new Response('Worker API is running. Use /api/folders and /api/notes. Deploy with assets to serve frontend.', { headers: { 'Content-Type': 'text/plain' } });
    }
    if (!db) return new Response(JSON.stringify({ error: 'D1 binding DB not found' }), { status: 500, headers: cors });
    try {
      const id = url.searchParams.get('id');
      if (url.pathname.includes('/folders')) {
        if (request.method === 'GET') { const { results } = await db.prepare("SELECT * FROM folders ORDER BY createdAt DESC").all(); return new Response(JSON.stringify(results), { headers: cors }); }
        if (request.method === 'POST') { const b = await request.json(); const nid = b.id || 'f_'+Math.random().toString(36).slice(2,8); await db.prepare("INSERT OR REPLACE INTO folders (id,name,emoji,color,createdAt) VALUES (?,?,?,?,?)").bind(nid, (b.name||'untitled').toLowerCase(), b.emoji||'📁', b.color||'#FEF08A', new Date().toISOString()).run(); const { results } = await db.prepare("SELECT * FROM folders WHERE id=?").bind(nid).all(); return new Response(JSON.stringify(results[0]), { headers: cors }); }
        if (request.method === 'PUT' && id) { const b = await request.json(); await db.prepare("UPDATE folders SET name=COALESCE(?,name), emoji=COALESCE(?,emoji), color=COALESCE(?,color) WHERE id=?").bind(b.name?b.name.toLowerCase():null, b.emoji||null, b.color||null, id).run(); const { results } = await db.prepare("SELECT * FROM folders WHERE id=?").bind(id).all(); return new Response(JSON.stringify(results[0]), { headers: cors }); }
        if (request.method === 'DELETE' && id) { await db.prepare("DELETE FROM folders WHERE id=?").bind(id).run(); await db.prepare("UPDATE notes SET folderId=NULL WHERE folderId=?").bind(id).run(); return new Response(JSON.stringify({ ok: true }), { headers: cors }); }
      }
      if (url.pathname.includes('/notes')) {
        if (request.method === 'GET') { const { results } = await db.prepare("SELECT * FROM notes ORDER BY updatedAt DESC").all(); return new Response(JSON.stringify(results.map(r=>({...r, tags: JSON.parse(r.tags||'[]'), pinned:!!r.pinned}))), { headers: cors }); }
        if (request.method === 'POST') { const b = await request.json(); const nid = b.id || 'n_'+Math.random().toString(36).slice(2,8); const now = new Date().toISOString(); const tags = b.tags||[]; if (tags.length>0){ for(const t of tags){ const ex = await db.prepare("SELECT id FROM folders WHERE LOWER(name)=LOWER(?)").bind(t).all(); if(ex.results.length===0){ const fid='f_'+Math.random().toString(36).slice(2,8); await db.prepare("INSERT INTO folders (id,name,emoji,color,createdAt) VALUES (?,?,?,?,?)").bind(fid, t.toLowerCase(), '📁', '#FEF08A', now).run(); } } if(!b.folderId){ const fm = await db.prepare("SELECT id FROM folders WHERE LOWER(name)=?").bind(tags[0].toLowerCase()).all(); if(fm.results.length>0) b.folderId=fm.results[0].id; } } await db.prepare("INSERT OR REPLACE INTO notes (id,title,content,folderId,tags,color,pinned,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?)").bind(nid, b.title||'Untitled', b.content||'', b.folderId||null, JSON.stringify(tags), b.color||'#FFFFFF', b.pinned?1:0, b.createdAt||now, now).run(); const { results } = await db.prepare("SELECT * FROM notes WHERE id=?").bind(nid).all(); return new Response(JSON.stringify({...results[0], tags: JSON.parse(results[0].tags||'[]'), pinned:!!results[0].pinned}), { headers: cors }); }
        if (request.method === 'PUT' && id) { const b = await request.json(); const now = new Date().toISOString(); const ex = await db.prepare("SELECT * FROM notes WHERE id=?").bind(id).all(); const tags = b.tags? JSON.stringify(b.tags) : ex.results[0].tags; await db.prepare("UPDATE notes SET title=?, content=?, folderId=?, tags=?, color=?, pinned=?, updatedAt=? WHERE id=?").bind(b.title?? ex.results[0].title, b.content?? ex.results[0].content, b.folderId!==undefined?b.folderId:ex.results[0].folderId, tags, b.color?? ex.results[0].color, b.pinned!==undefined?(b.pinned?1:0):ex.results[0].pinned, now, id).run(); const { results } = await db.prepare("SELECT * FROM notes WHERE id=?").bind(id).all(); return new Response(JSON.stringify({...results[0], tags: JSON.parse(results[0].tags||'[]'), pinned:!!results[0].pinned}), { headers: cors }); }
        if (request.method === 'DELETE' && id) { await db.prepare("DELETE FROM notes WHERE id=?").bind(id).run(); return new Response(JSON.stringify({ ok: true }), { headers: cors }); }
      }
    } catch(e){ return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors }); }
  }
};
