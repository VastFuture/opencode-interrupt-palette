import { Plugin } from "@opencode/plugin/tui"

/** Built-in OpenCode command that interrupts the session the prompt is attached to. */
const INTERRUPT = "session.interrupt"

/**
 * The built-in interrupt needs two presses: the first one arms it ("again to
 * interrupt"), the second one actually interrupts. A palette entry should take
 * one action, so it sends both presses.
 *
 * The command palette restores focus to the prompt on a ~1ms timer after it
 * closes, and the built-in interrupt ignores dispatches while the prompt is
 * blurred. Waiting for that timer keeps the action working when it is picked
 * from the palette.
 */
const FOCUS_RESTORE_DELAY_MS = 10

export default Plugin.define({
  id: "personal.interrupt-palette",
  setup(context) {
    context.keymap.layer(() => ({
      mode: "global",
      commands: [
        {
          id: "personal.interrupt",
          title: "Interrupt session",
          group: "Session",
          palette: true,
          run: () => {
            setTimeout(() => {
              // Arm, then confirm.
              context.keymap.dispatch(INTERRUPT)
              context.keymap.dispatch(INTERRUPT)
            }, FOCUS_RESTORE_DELAY_MS)
          },
        },
      ],
    }))
  },
})
