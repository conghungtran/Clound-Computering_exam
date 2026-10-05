// Tự động dựng lịch sử Git: 2 nhánh tính năng + 2 merge node (--no-ff)
// Chạy 1 lần duy nhất, trong thư mục project CHƯA có .git:   node setup-git.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sh = (cmd) => { console.log('$ ' + cmd); execSync(cmd, { stdio: 'inherit' }); };
const read = (f) => fs.readFileSync(f, 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(f) || '.', { recursive: true }); fs.writeFileSync(f, s); };
const norm = (s) => s.replace(/\r\n/g, '\n').trim();

// Giữ/bỏ các khối "// #DB-START ... // #DB-END" và "// #SESSION-START ... // #SESSION-END"
function stage(src, keep) {
  const out = [];
  let block = null;
  for (const line of src.split(/\r?\n/)) {
    const m = line.match(/^\s*\/\/ #(DB|SESSION)-(START|END)\s*$/);
    if (m) { block = m[2] === 'START' ? m[1] : null; continue; }
    if (block && !keep.includes(block)) continue;
    out.push(line);
  }
  return out.join('\n');
}

if (fs.existsSync('.git')) {
  console.error('Thư mục này đã có .git, dừng lại để tránh ghi đè lịch sử.');
  process.exit(1);
}
if (!fs.existsSync('.gitignore')) { console.error('Thiếu .gitignore'); process.exit(1); }

const FINAL = read('app.js');
const DB_FILES = ['db.js', 'views/books.hbs'];
const SESSION_FILES = ['session.js'];

// Tạm cất các file thuộc về nhánh tính năng
const saved = {};
for (const f of [...DB_FILES, ...SESSION_FILES]) { saved[f] = read(f); fs.unlinkSync(f); }
write('app.js', stage(FINAL, []));

// 1) main: bộ khung ban đầu
sh('git init');
sh('git symbolic-ref HEAD refs/heads/main');
sh('git add .');
sh('git status --short');
sh('git commit -m "chore: init project skeleton"');

// 2) nhánh database
sh('git checkout -b feature/database');
for (const f of DB_FILES) write(f, saved[f]);
write('app.js', stage(FINAL, ['DB']));
sh('git add .');
sh('git commit -m "feat(db): dual connection read/write, prefix filter, VAT calculation"');

// 3) nhánh session (tách từ main, không phải từ nhánh database)
sh('git checkout main');
sh('git checkout -b feature/session');
for (const f of SESSION_FILES) write(f, saved[f]);
write('app.js', stage(FINAL, ['SESSION']));
sh('git add .');
sh('git commit -m "feat(session): store sessions in MongoDB Atlas via connect-mongo"');

// 4) gộp về main, luôn tạo merge commit
sh('git checkout main');
sh('git merge --no-ff feature/database -m "Merge branch feature/database into main"');
sh('git merge --no-ff feature/session -m "Merge branch feature/session into main"');

sh('git log --graph --oneline --all');

const ok = norm(read('app.js')) === norm(stage(FINAL, ['DB', 'SESSION']));
console.log(ok ? '\nOK: app.js sau khi gộp đúng như mong đợi.' : '\nCẢNH BÁO: app.js sau khi gộp khác dự kiến, hãy kiểm tra lại.');
