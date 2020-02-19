package com.wikitude.MuseumAR;

import android.Manifest;
import android.os.Build;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.Toast;

import com.wikitude.architect.ArchitectJavaScriptInterfaceListener;
import com.wikitude.architect.ArchitectStartupConfiguration;
import com.wikitude.architect.ArchitectView;
import com.wikitude.common.camera.CameraSettings;

import org.json.JSONObject;

import java.io.IOException;

public class MainActivity extends AppCompatActivity {

    protected ArchitectView architectView;
    public static final String TAG="simpleAr";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        /*LayoutInflater inflater = (LayoutInflater) getSystemService(LAYOUT_INFLATER_SERVICE);
        ConstraintLayout parent = (ConstraintLayout) inflater.inflate(R.layout.activity_main, null);
        ViewGroup parentViewGroup = (ViewGroup) parent.getParent();
        if (parentViewGroup != null) {
            parentViewGroup.removeAllViews();
        }*/
        setContentView(R.layout.activity_main);
        //setContentView(parent);
        WebView.setWebContentsDebuggingEnabled(true);

        final ArchitectStartupConfiguration config=new ArchitectStartupConfiguration();
        config.setLicenseKey(getString(R.string.wikitude_license_key));
        config.setCameraPosition(CameraSettings.CameraPosition.BACK);
        config.setCameraResolution(CameraSettings.CameraResolution.SD_640x480);
        config.setCameraFocusMode(CameraSettings.CameraFocusMode.CONTINUOUS);
        config.setCamera2Enabled(true);

        //architectView=new ArchitectView(this);
        this.architectView=(ArchitectView)this.findViewById(R.id.architectView);
        if(architectView.getParent()!=null){
            ((ViewGroup)architectView.getParent()).removeAllViews();
        }
        architectView.onCreate(config);

        setContentView(architectView);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            requestPermissions(new String[]{Manifest.permission.CAMERA, Manifest.permission.WRITE_EXTERNAL_STORAGE}, 0);
        }
    }

    @Override
    protected void onPostCreate(@Nullable Bundle savedInstanceState){
        super.onPostCreate(savedInstanceState);
        architectView.onPostCreate();

        try{
            architectView.load("index.html");
            architectView.addArchitectJavaScriptInterfaceListener(new ArchitectJavaScriptInterfaceListener() {
                @Override
                public void onJSONObjectReceived(JSONObject jsonObject) {

                }
            });
        }catch(IOException e){
            Toast.makeText(this, "Could not load AR experience", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        architectView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        architectView.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        architectView.clearCache();
        architectView.onDestroy();
    }
}
