import TiptapHorizontalRule from "@tiptap/extension-horizontal-rule"
import { mergeAttributes } from "@tiptap/react"

export const HorizontalRule = TiptapHorizontalRule.extend({
  renderHTML() {
    return ["div", mergeAttributes(this.options.HTMLAttributes, { "data-type": this.name }), ["hr"]]
  },
})

export default HorizontalRule
