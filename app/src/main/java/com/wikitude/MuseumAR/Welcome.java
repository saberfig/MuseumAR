package com.wikitude.MuseumAR;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.widget.TextView;

public class Welcome extends Activity{
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.welcome);
        //Set the front of the title text as WenYue
        TextView titleText = (TextView)findViewById(R.id.title_expo);
        Typeface frontWenYue = Typeface.createFromAsset(getAssets(),"fonts/WenYue.otf");
        titleText.setTypeface(frontWenYue);
        handler.sendEmptyMessageDelayed(0,3000);//Set the delaytime as 3000ms
    }
    private Handler handler = new Handler(){
        @Override
        public void handleMessage(Message msg) {
            getHome();
            super.handleMessage(msg);
        }
    };
    public void getHome(){
<<<<<<< HEAD
        Intent intent = new Intent(Welcome.this,Home.class);
=======
        Intent intent = new Intent(Welcome.this,MainActivity.class);
>>>>>>> e2a74d4beb5d8ba1d3aa1d44ccde89c777c16ce9
        startActivity(intent);
        finish();
    }
}
