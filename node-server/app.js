const http = require("http");
const path = require("path");
const fs = require("mz/fs");

const server = http.createServer(async (req, res) => {
  let range = req.headers["range"];
  let p = path.join(__dirname, `/static/demo.pdf`);
  console.log(p);
  // 确认文件是否存在
  let fileState;
  try {
    fileState = await fs.stat(p);
  } catch (e) {
    res.statusCode = 404; // 设置 404 错误状态码
    res.end("File Not Found");
    return; // 文件不存在时直接返回，停止继续执行
  }

  let total = fileState.size;

  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Expose-Headers", "Accept-Ranges,Content-Range");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Type", "application/pdf");

  if (range) {
    let [, start, end] = range.match(/(\d*)-(\d*)/);

    start = start ? parseInt(start) : 0;
    end = end ? parseInt(end) : total - 1;

    res.statusCode = 206;
    res.setHeader("Content-Length", end - start + 1);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${total}`);
    fs.createReadStream(p, { start, end }).pipe(res);
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Length", Number(total));
    fs.createReadStream(p).pipe(res);
  }
});

server.listen(3000, () => {
  console.log("server start 3000");
});
