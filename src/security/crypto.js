// /**
//  * Camada de Criptografia de Dados (AES-GCM)
//  * Protege os dados armazenados no localStorage contra acesso direto.
//  * Nota: Como é um app client-side, a chave final reside no código, mas
//  * esta camada impede a leitura trivial por ferramentas de sistema ou arquivos.
//  */

// const STORAGE_SALT = 'IndusPower_Ficha_v1'

// // Em uma implementação de "Total Segurança", essa chave viria do login do usuário.
// // Por enquanto, usamos uma chave gerada a partir do nome do app.
// async function getEncryptionKey() {
//   const enc = new TextEncoder()
//   const keyMaterial = await crypto.subtle.importKey(
//     'raw',
//     enc.encode(STORAGE_SALT),
//     'PBKDF2',
//     false,
//     ['deriveBits', 'deriveKey']
//   )
  
//   return crypto.subtle.deriveKey(
//     {
//       name: 'PBKDF2',
//       salt: enc.encode('ip-salt-fixed'),
//       iterations: 100000,
//       hash: 'SHA-256'
//     },
//     keyMaterial,
//     { name: 'AES-GCM', length: 256 },
//     true,
//     ['encrypt', 'decrypt']
//   )
// }

// /**
//  * Encripta um objeto JSON em uma string Base64 segura.
//  */
// export async function encryptData(data) {
//   try {
//     const key = await getEncryptionKey()
//     const iv = crypto.getRandomValues(new Uint8Array(12))
//     const enc = new TextEncoder()
//     const encoded = enc.encode(JSON.stringify(data))

//     const ciphertext = await crypto.subtle.encrypt(
//       { name: 'AES-GCM', iv },
//       key,
//       encoded
//     )

//     // Combina IV + Ciphertext para armazenamento
//     const combined = new Uint8Array(iv.length + ciphertext.byteLength)
//     combined.set(iv)
//     combined.set(new Uint8Array(ciphertext), iv.length)

//     // Converte para Base64 para salvar no localStorage
//     return btoa(String.fromCharCode.apply(null, combined))
//   } catch (err) {
//     console.error('[Security] Falha na encriptação:', err)
//     return null
//   }
// }

// /**
//  * Decripta uma string Base64 em um objeto JavaScript.
//  */
// export async function decryptData(encryptedBase64) {
//   if (!encryptedBase64) return null

//   try {
//     const key = await getEncryptionKey()
//     const combined = new Uint8Array(
//       atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
//     )

//     const iv = combined.slice(0, 12)
//     const ciphertext = combined.slice(12)

//     const decrypted = await crypto.subtle.decrypt(
//       { name: 'AES-GCM', iv },
//       key,
//       ciphertext
//     )

//     const dec = new TextDecoder()
//     return JSON.parse(dec.decode(decrypted))
//   } catch (err) {
//     console.error('[Security] Dados corrompidos ou chave inválida:', err)
//     return null
//   }
// }
