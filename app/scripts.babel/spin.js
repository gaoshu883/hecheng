export default {
  template: `
    <div class="ivu-spin-fix">
      <div class="ivu-spin-main">
        <span class="ivu-spin-dot"></span>
        <div class="ivu-spin-text">{{spinText}}</div>
      </div>
    </div>
  `,
  props: {
    spinText: String
  }
}