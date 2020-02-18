package com.wikitude.MuseumAR;
import android.content.Intent;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;

import android.support.v7.app.AppCompatActivity;
import android.widget.FrameLayout;

public class Home extends AppCompatActivity {
    private static final String TAG = "Home";
    //手指按下的点为(x1, y1)手指离开屏幕的点为(x2, y2)
    float x1 = 0;
    float x2 = 0;
    float y1 = 0;
    float y2 = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.home);

        FrameLayout camera = findViewById(R.id.main_button);//通过按钮进入MainActivity
        camera.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent();
                intent.setClass(Home.this, MainActivity.class);
                startActivity(intent);
            }
        });
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        //继承了Activity的onTouchEvent方法，直接监听点击事件
        if (event.getAction() == MotionEvent.ACTION_DOWN) {
            //当手指按下的时候
            x1 = event.getX();
            y1 = event.getY();
        }
        if (event.getAction() == MotionEvent.ACTION_MOVE) {
            //当手指滑动的时候
            x2 = event.getX();
            y2 = event.getY();

        }
        if (event.getAction()==MotionEvent.ACTION_UP){
            //当手指离开的时候
            if(y1 - y2 > 150) {
                Intent intent = new Intent(Home.this, IdentifiableList.class);
                startActivity(intent);
                overridePendingTransition(R.anim.in_from_up, R.anim.out_to_up);
            }
        }
        return super.onTouchEvent(event);
    }


}