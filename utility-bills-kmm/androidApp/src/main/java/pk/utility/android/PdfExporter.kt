package pk.utility.android

import android.content.ContentValues
import android.content.Context
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.annotation.RequiresApi
import java.io.OutputStream

object PdfExporter {
    fun exportSimpleBillPdf(
        context: Context,
        title: String,
        lines: List<String>,
        fileName: String = "bill-summary.pdf"
    ): Uri? {
        val doc = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4
        val page = doc.startPage(pageInfo)
        val canvas = page.canvas
        val paint = android.graphics.Paint().apply { textSize = 14f }
        var y = 40f
        paint.isFakeBoldText = true
        canvas.drawText(title, 40f, y, paint)
        paint.isFakeBoldText = false
        y += 20f
        lines.forEach {
            y += 20f
            canvas.drawText(it, 40f, y, paint)
        }
        doc.finishPage(page)

        val resolver = context.contentResolver
        val values = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
            put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
            put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
        }
        val uri = resolver.insert(MediaStore.Files.getContentUri("external"), values)
        val out: OutputStream? = uri?.let { resolver.openOutputStream(it) }
        out.use { stream ->
            if (stream != null) doc.writeTo(stream)
        }
        doc.close()
        return uri
    }
}

