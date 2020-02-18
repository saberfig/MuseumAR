package com.wikitude.MuseumAR;

import android.Manifest;
import android.os.Build;
import android.support.annotation.Nullable;
<<<<<<< HEAD
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.Toast;

import com.wikitude.architect.ArchitectJavaScriptInterfaceListener;
=======
import android.support.constraint.ConstraintLayout;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.Toast;

>>>>>>> e2a74d4beb5d8ba1d3aa1d44ccde89c777c16ce9
import com.wikitude.architect.ArchitectStartupConfiguration;
import com.wikitude.architect.ArchitectView;
import com.wikitude.common.camera.CameraSettings;

<<<<<<< HEAD
import org.json.JSONObject;

=======
>>>>>>> e2a74d4beb5d8ba1d3aa1d44ccde89c777c16ce9
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

<<<<<<< HEAD

=======
>>>>>>> e2a74d4beb5d8ba1d3aa1d44ccde89c777c16ce9
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
<<<<<<< HEAD
            architectView.addArchitectJavaScriptInterfaceListener(new ArchitectJavaScriptInterfaceListener() {
                @Override
                public void onJSONObjectReceived(JSONObject jsonObject) {

                }
            });
=======
>>>>>>> e2a74d4beb5d8ba1d3aa1d44ccde89c777c16ce9
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
