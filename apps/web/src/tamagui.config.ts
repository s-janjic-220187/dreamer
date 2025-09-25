import { createTamagui } from '@tamagui/core'
import { config as configBase } from '@tamagui/config/v3'

const config = createTamagui(configBase)

export type Conf = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}

export { config }