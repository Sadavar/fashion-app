import { useEffect, useState } from 'react';
import { ColorSchemeName } from 'react-native';

export default function useColorScheme(): ColorSchemeName {
    const [colorScheme, setColorScheme] = useState<ColorSchemeName>('light');

    // TODO: Implement actual color scheme detection
    return colorScheme;
}
