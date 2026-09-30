# WHO AM I

> Every thought is a part of me.

Application mobile React Native + Expo pour écrire et conserver ses pensées
localement, sans compte et sans serveur.

## Fonctionnalités

- Création, modification et suppression de pensées
- Titre facultatif et humeur facultative
- Favoris
- Recherche locale dans les titres et contenus
- Sauvegarde hors ligne sur l'appareil
- Brouillon sauvegardé automatiquement pendant l'écriture
- Export JSON par le presse-papiers
- Import d'un export JSON par collage
- Verrouillage par PIN stocké dans SecureStore
- Déverrouillage biométrique lorsqu'il est disponible
- Icône et splash screen WHO AM I

## Prérequis

- Node.js 20 ou plus récent
- pnpm 9 ou plus récent
- Pour tester sur un téléphone : Expo Go compatible avec le SDK 57
- Pour produire un APK : Android Studio, un JDK 17, Android SDK et un
  émulateur ou un téléphone Android

Vérifier les outils Android avec :

```bash
java -version
adb version
```

Les variables suivantes doivent pointer vers le SDK Android :

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

Sur Windows, configure les mêmes variables depuis les paramètres système
avec le chemin du SDK installé par Android Studio.

## Installation

Depuis le dossier `who-am-i` :

```bash
pnpm install
```

Si tu as récupéré l'application depuis tout le monorepo, tu peux aussi lancer
la commande à la racine :

```bash
pnpm install
pnpm --filter @workspace/who-am-i run typecheck
```

## Tester avec Expo Go

Lancer Metro :

```bash
pnpm exec expo start
```

Scanne ensuite le QR code avec Expo Go. Pour un téléphone qui n'est pas sur
le même réseau, utilise le mode tunnel :

```bash
pnpm exec expo start --tunnel
```

Pour tester dans un navigateur :

```bash
pnpm exec expo start --web
```

## Générer un APK Android de debug

Cette version est installable directement sur un appareil Android et convient
pour les tests :

```bash
pnpm exec expo prebuild --platform android
pnpm exec expo run:android --variant debug
```

Le fichier généré se trouve généralement ici :

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Tu peux l'installer sur un téléphone connecté avec :

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Générer un APK Android de release

Pour produire une version release locale :

```bash
pnpm exec expo prebuild --platform android
cd android
./gradlew assembleRelease
cd ..
```

Le fichier est généralement disponible ici :

```text
android/app/build/outputs/apk/release/app-release.apk
```

Sur Windows, utilise `gradlew.bat` à la place de `./gradlew`.

### Signature de production

Un APK release destiné à être distribué doit être signé avec une clé Android
que tu conserves en lieu sûr. Ne commit jamais le keystore, son mot de passe
ou les fichiers de secrets dans Git.

Pour Google Play, le format recommandé est l'AAB :

```bash
cd android
./gradlew bundleRelease
```

Le fichier est généralement ici :

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## Identité de l'application

- Nom : `WHO AM I`
- Identifiant Android : `com.whoami.thoughts`
- Identifiant iOS : `com.whoami.thoughts`
- Icône : `assets/images/icon.png`
- Logo et splash : `assets/images/logo.png`

Ne change pas les identifiants après une première publication, sinon Android
et iOS considéreront l'application comme une nouvelle application.

## Structure principale

```text
app/
  _layout.tsx             navigation et providers
  index.tsx               accueil
  write.tsx               création et édition
  search.tsx              recherche locale
  settings.tsx            sécurité, import/export, données
  lock.tsx                écran de verrouillage
  thought/[id].tsx        détail d'une pensée
components/
  ui.tsx                  composants de l'interface
context/
  AppContext.tsx          état et persistance locale
types/
  thought.ts              types et humeurs
assets/images/
  icon.png                symbole de l'application
  logo.png                logo complet utilisé par le splash
```

## Données et confidentialité

Les pensées restent sur l'appareil et sont persistées avec AsyncStorage dans
la première version. Le PIN est stocké avec `expo-secure-store`. Aucun compte,
backend ou synchronisation cloud n'est requis.

L'import accepte uniquement un objet JSON exporté par WHO AM I avec cette
forme :

```json
{
  "version": 1,
  "exportedAt": "2026-09-29T00:00:00.000Z",
  "thoughts": []
}
```

## Vérifications utiles

```bash
pnpm run typecheck
pnpm exec expo install --check
pnpm dlx expo-doctor@latest
```

Si Expo signale une incompatibilité de version, exécute :

```bash
pnpm exec expo install --fix
```

## Limites connues de cette version

- L'import se fait par collage du JSON exporté, afin de rester compatible
  avec l'environnement Expo actuel.
- La génération d'APK nécessite une machine ou une CI disposant de Java,
  Gradle et du SDK Android.
- La synchronisation entre plusieurs appareils n'est pas incluse.