// immediatly create a { } scope so no code from this file leaks to global Scope
{
  // This <exec-code></exec-code> Web Component uses the BlogCells library
  // https://github.com/rameshvarun/blog-cells
  // if that library is not loaded yet, it will be loaded automatically

  // source for Blog Cells library
  const blogcell = "https://exec-code.github.io/blog-cells.";

  // generic createElement function
  const createElement = (tag, props = {}) => Object.assign(document.createElement(tag), props);

  /*
    define <exec-code></exec-code> Web Component
   
    attributes:
    autorun: run code block on load
    runcode: run code block #NR
    autoupdate: run code block on keyup
  */
  customElements.define("exec-code", class extends HTMLElement {
    get runcode() {
      // if attribute=NR exists on <exec-code> then run code block #NR
      return ~~(this.getAttribute("runcode") || 1);
    }
    connectedCallback() {
      // URL to BlogCells
      // function init <exec-code> Web Component
      /* function */ const initExecCodeComponent = () => {
        this.content = this.querySelector("template").content;
        if (this.content)
          this.renderCodeBlock(this.runcode);
        else return console.error("Missing <template>");
      }
      const selector = `[src^="${blogcell}"]`;
      if (document.querySelector(selector)) {
        // if blog-cell is already loaded init this <exec-code> Web Component
        // after 1 millisecond so <exec-code> innerHTML is parsed
        setTimeout(initExecCodeComponent, 1);
      } else {
        // if blog-cell is not loaded yet, load CSS and JS files and init this <exec-code></exec-code> Web Component
        document.body.append(
          createElement("link", {
            rel: "stylesheet",
            href: blogcell + "css"
          }),
          createElement("script", {
            src: blogcell + "js",
            onload: initExecCodeComponent
          })
        )
      }
    }
    renderCodeBlock(codenr = 1) {
      let selector = typeof codenr === "string" ? codenr : `code:nth-of-type(${codenr})`;
      this.code = this.content.querySelector(selector);
      if (this.code) {
        this.setscript(this.code.innerHTML);
      } else {
        console.error(`Missing <code block #${codenr}> in:`, this, "\nNow executing previous <code> block",);
        if (codenr > 1) this.renderCodeBlock(codenr - 1);
      }
    }
    // (un)lock code block so user can (not) edit it
    set locked(lock = true) {
      let blogCell_content = this.querySelector(".cm-content");
      if (blogCell_content) {
        blogCell_content.toggleAttribute("contenteditable", !lock);
        blogCell_content.style.userSelect = lock ? "none" : "initial";
      } else {
        console.error("Missing .cm-content");
      }
    }
    extractscript(txt) {
      return txt.split("\n").filter(Boolean)
        .map(line => line
          //.trim()
          .replace("\t", "")
          //.replace("    ", "")
          .replace("firstName", "Tijn")
        ).join("\n");
    }
    setscript(txt) {
      if (BlogCells) {
        let lines = this.extractscript(txt);
        let script = this.appendscript(lines);
        BlogCells.processBlogCell(script);
        if (this.hasAttribute("autoupdate")) this.onkeyup = () => this.run();
        if (this.hasAttribute("autorun")) setTimeout(() => this.run(), 1);
        setTimeout(() => this.afterinit(), 1000);
      } else {
        console.error("Missing BlogCells");
      }
    }
    afterinit() {
      this.locked = this.code && this.code.hasAttribute("locked");
    }

    // number of characters indentation
    get indent(){
      return this.getAttribute("indent") || 4;
    }
    appendscript(innerHTML, autorun = true) {
      console.warn(21, this.querySelector("#newscript"));
      if (!this.hasAttribute("autoindent")) {
        innerHTML = indentJSCode(innerHTML,this.indent);
      }
      console.log(innerHTML.split("\n    "))
      let newscript = this.appendChild(
        createElement("script", {
          id: "newscript",
          type: "text/notebook-cell", // not required
          innerHTML
        })
      );
      return newscript;
    }
    afterrun() {
      let cellEditors = this.querySelectorAll(".cell-editor");
      console.warn("afterrun");
      if (cellEditors.length > 1) {
        console.warn("BlogCells created more than 1 .cell-editor");
        cellEditors[0].remove();
      }
    }
    run() {
      let runbar = this.querySelector(".run-bar");
      if (runbar) {
        runbar.click();
        setTimeout(() => {
          this.afterrun();
        }, 500);
      } else {
        console.error("Missing .run-bar");
      }
    }
    get outputerror() {
      let outputerror = this.querySelector(".output-error");
      if (outputerror) return outputerror.innerHTML;
      else return false;
    }
  });


  // indent JavaScript code
  function indentJSCode(jsCode, indentSize = 4) {
    let lines = jsCode.split('\n');
    let indentLevel = 0;
    let indentString = ' '.repeat(indentSize);
    return lines.map(line => {
      if (line.includes('}')
        //|| line.includes(']')
      ) indentLevel--;
      if (indentLevel < 0) indentLevel = 0;
      let indentedLine = indentString.repeat(indentLevel) + line.trim();
      if (line.includes('{')
        //|| line.includes('[')
      ) indentLevel++;
      return indentedLine;
    }).join('\n');
  }

}