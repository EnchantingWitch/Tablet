import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const SmartKeyboardView = ({ children, style }) => {
  return (
    <KeyboardAwareScrollView
      style={style}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      enableResetScrollToCoords={false}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

export default SmartKeyboardView;