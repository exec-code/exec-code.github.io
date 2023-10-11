  customElements.define("exec-code", class extends HTMLElement {
    connectedCallback() {
      const createElement = (tag, props = {}) => Object.assign(document.createElement(tag), props);
      const blogcell = "https://exec-code.github.io/blog-cells.";
      const render = () => document.body.append(
          createElement("script",{
          	type:"text/notebook-cell",
            innerHTML: `let a="bar";
console.log("Hello shadowDOM World!",a);`
          })
      );
      const loadblogcell = () => {
      	console.log("Load blogcell CSS and JS");
        document.body.append(
          createElement("link", {
            rel: "stylesheet",
            href: blogcell + "css"
          }),
          createElement("script", {
            src: blogcell + "js",
            onload: () => {
              console.log("Loaded", blogcell);
              setTimeout(()=>render(),2000);
            }
          })
        )
        document.dispatchEvent("DOMContentLoaded");
      }
      if (document.querySelector(`[src^="${blogcell}"]`)) {
        console.log(666, "existing script");
        this.render();
      } else {
        //this.render();
        console.log(666, "new script");
        loadblogcell();
      }
    }
    render() {
    	console.log("render");
      this.innerHTML =
        `<script type="text/notebook-cell">
let a="foo";
console.log("Hello shadowDOM World!",a);
<\/script>`;
      this.onkeyup = () => this.run();
      setTimeout(() => this.run(), 1000);
    }
    run() {
      this.querySelector(".run-bar").click();
    }
  });