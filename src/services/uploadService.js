import { supabase } from '../lib/supabase'

export async function uploadFoto(file, ficha) {
  try {

    const ext = file.name.split('.').pop()

    // lista fotos da ficha
    const { data: files, error: listError } =
      await supabase.storage
        .from('fotos-fichas')
        .list(ficha.codigo, {
          limit: 1000
        })

    if (listError) throw listError

    // próxima versão
    const nextVersion =
      (files?.length || 0) + 1

    // nome final
    const fileName =
      `${ficha.codigo}/` +
      `${ficha.codigo}_(${nextVersion}).${ext}`

    // upload
    const { error } =
      await supabase.storage
        .from('fotos-fichas')
        .upload(fileName, file)

    if (error) throw error

    // url pública
    const { data } =
      supabase.storage
        .from('fotos-fichas')
        .getPublicUrl(fileName)

    return data.publicUrl

  } catch (err) {
    console.error('[Upload] Erro:', err)
    return null
  }
}
// ======================================
// PDF
// ======================================

export async function uploadPdf(pdfBlob, ficha) {
  try {

    // lista arquivos existentes no bucket
    const { data: files, error: listError } =
      await supabase.storage
        .from('pdfs')
        .list('', {
          limit: 1000
        })

    if (listError) throw listError

    // pega arquivos da mesma ficha
    const sameFiles = files.filter(file =>
      file.name.startsWith(ficha.codigo)
    )

    // próxima versão
    const nextVersion = sameFiles.length + 1

    // nome final
    const fileName =
      `${ficha.codigo}_(${nextVersion}).pdf`

    // upload
    const { error: uploadError } =
      await supabase.storage
        .from('pdfs')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf'
        })

    if (uploadError) throw uploadError

    // atualiza banco
    const currentVersions =
      ficha.pdf_versions || []

    const updatedVersions = [
      ...currentVersions,
      fileName
    ]

    const { error: updateError } =
      await supabase
        .from('fichas')
        .update({
          pdf_versions: updatedVersions
        })
        .eq('id', ficha.dbId)

    if (updateError) throw updateError

    return fileName

  } catch (err) {
    console.error('[PDF Upload]', err)
    return null
  }
}