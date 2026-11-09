package de.zerotower.mio;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import org.json.JSONObject;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public final class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 431;
    private static final String APP_HOST = "appassets.androidplatform.net";
    private WebView view;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(13, 20, 37));
        getWindow().setNavigationBarColor(Color.rgb(13, 20, 37));

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        view = new WebView(this);
        view.setBackgroundColor(Color.rgb(13, 20, 37));
        view.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        view.setVerticalScrollBarEnabled(false);
        WebSettings options = view.getSettings();
        options.setJavaScriptEnabled(true);
        options.setDomStorageEnabled(true);
        options.setAllowFileAccess(false);
        options.setAllowContentAccess(true);
        options.setAllowFileAccessFromFileURLs(false);
        options.setAllowUniversalAccessFromFileURLs(false);
        options.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        view.addJavascriptInterface(new BackupBridge(), "MioAndroid");

        view.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView webView, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView webView, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("https".equals(uri.getScheme()) && APP_HOST.equals(uri.getHost())) {
                    return false;
                }
                if ("http".equals(uri.getScheme()) || "https".equals(uri.getScheme())) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    } catch (Exception error) {
                        notifyUser("Kein Browser verfügbar.");
                    }
                }
                return true;
            }
        });

        view.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView,
                    ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent choose = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                choose.addCategory(Intent.CATEGORY_OPENABLE);
                choose.setType("application/json");
                try {
                    startActivityForResult(Intent.createChooser(choose, "mio.-Sicherung auswählen"),
                            FILE_CHOOSER_REQUEST);
                    return true;
                } catch (Exception error) {
                    fileCallback.onReceiveValue(null);
                    fileCallback = null;
                    notifyUser("Dateiauswahl ist nicht verfügbar.");
                    return false;
                }
            }
        });

        setContentView(view);
        view.loadUrl("https://" + APP_HOST + "/assets/index.html");
    }

    /** Nur die lokale, im Paket enthaltene mio.-Seite kann diesen Kanal aufrufen. */
    private final class BackupBridge {
        @JavascriptInterface
        public void saveBackup(String json) {
            if (json == null || json.length() > 1_000_000) {
                notifyUser("Sicherung ist zu groß.");
                return;
            }
            try {
                if (new JSONObject(json).optInt("version", 0) != 1) {
                    notifyUser("Ungültiger Spielstand.");
                    return;
                }
                String time = new SimpleDateFormat("yyyyMMdd-HHmm", Locale.ROOT).format(new Date());
                ContentValues metadata = new ContentValues();
                metadata.put(MediaStore.Downloads.DISPLAY_NAME, "mio-sicherung-" + time + ".json");
                metadata.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                metadata.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, metadata);
                if (uri == null) throw new IllegalStateException("Kein Speicherort gefunden");
                try (OutputStream output = getContentResolver().openOutputStream(uri)) {
                    if (output == null) throw new IllegalStateException("Datei kann nicht geschrieben werden");
                    output.write(json.getBytes(StandardCharsets.UTF_8));
                }
                notifyUser("Spielstand in Downloads gesichert.");
            } catch (Exception error) {
                notifyUser("Sicherung konnte nicht gespeichert werden.");
            }
        }
    }

    private void notifyUser(String message) {
        runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show());
    }

    @Override
    protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == FILE_CHOOSER_REQUEST && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data));
            fileCallback = null;
        }
    }

    @Override
    protected void onPause() {
        if (view != null) view.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (view != null) view.onResume();
    }

    @Override
    protected void onDestroy() {
        if (view != null) {
            view.removeJavascriptInterface("MioAndroid");
            view.destroy();
        }
        super.onDestroy();
    }
}
