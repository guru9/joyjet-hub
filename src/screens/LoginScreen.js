import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    KeyboardAvoidingView, 
    Platform, 
    TouchableWithoutFeedback, 
    Keyboard 
} from 'react-native';

export default function LoginScreen({ onLogin }) {
    const [name, setName] = useState('');
    const [key, setKey] = useState('');

    const handlePress = () => {
        const trimmedName = name.trim();
        const trimmedKey = key.trim();

        if (trimmedName.length < 3) {
            alert("Identifier must be at least 3 characters.");
            return;
        }

        // Logic handled by App.js & Server:
        // 1. Name: 'admin' + Key: 'GURU_8310' -> Full Admin
        // 2. Name: 'Alpha' -> Viewer (sees 'Alpha_***')
        // 3. Name: 'Alpha_01' -> Ghost Node (relays to 'Alpha')
        onLogin(trimmedName, trimmedKey);
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <View style={styles.header}>
                        <Text style={styles.logo}>JOYJET</Text>
                        <Text style={styles.title}>SYSTEM ACCESS</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>NODE IDENTIFIER</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="Enter Name or Name_Ghost"
                            placeholderTextColor="#333"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="none"
                            autoCorrect={false}
                            spellCheck={false}
                        />

                        <Text style={styles.label}>ENCRYPTION KEY (OPTIONAL)</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="Admin Security Key"
                            placeholderTextColor="#333"
                            secureTextEntry={true}
                            value={key}
                            onChangeText={setKey}
                            autoCapitalize="none"
                        />

                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={handlePress}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>ESTABLISH LINK</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>SECURE HUB v1.5.0</Text>
                        <Text style={styles.statusText}>ENCRYPTION: AES-256 ACTIVE</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    inner: {
        flex: 1,
        padding: 40,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logo: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 10,
    },
    title: {
        color: '#444',
        fontSize: 10,
        letterSpacing: 4,
        marginTop: 5,
        fontWeight: 'bold',
    },
    divider: {
        width: 40,
        height: 2,
        backgroundColor: '#ff0033',
        marginTop: 15,
    },
    form: {
        width: '100%',
    },
    label: {
        color: '#222',
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 1,
    },
    input: {
        backgroundColor: '#050505',
        borderWidth: 1,
        borderColor: '#111',
        borderRadius: 4,
        color: '#fff',
        padding: 18,
        fontSize: 14,
        marginBottom: 25,
        letterSpacing: 1,
    },
    button: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 3,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#111',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    statusText: {
        color: '#080808',
        fontSize: 8,
        marginTop: 4,
        letterSpacing: 1,
    }
});
