package com.moony.iotcontrol;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.adapter.FragmentStateAdapter;
import androidx.viewpager2.widget.ViewPager2;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationView;
import com.google.android.material.textfield.TextInputEditText;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private DrawerLayout drawerLayout;
    private NavigationView navigationView;
    private BottomNavigationView bottomNav;
    private ViewPager2 viewPager;
    private View statusIndicator;
    private TextView statusText, deviceCountText;

    private WebSocketManager wsManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        wsManager = WebSocketManager.getInstance();

        // Initialize views
        drawerLayout = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.nav_view);
        bottomNav = findViewById(R.id.bottom_navigation);
        viewPager = findViewById(R.id.view_pager);
        statusIndicator = findViewById(R.id.status_indicator);
        statusText = findViewById(R.id.status_text);
        deviceCountText = findViewById(R.id.device_count);

        // Setup toolbar (hamburger menu toggle)
        findViewById(R.id.toolbar).setOnClickListener(v -> drawerLayout.openDrawer(GravityCompat.START));

        // Setup ViewPager with fragments
        setupViewPager();

        // Setup bottom navigation sync with ViewPager
        bottomNav.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_devices) {
                viewPager.setCurrentItem(0);
                return true;
            } else if (itemId == R.id.nav_chat) {
                viewPager.setCurrentItem(1);
                return true;
            } else if (itemId == R.id.nav_commands) {
                viewPager.setCurrentItem(2);
                return true;
            }
            return false;
        });

        viewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                switch (position) {
                    case 0: bottomNav.setSelectedItemId(R.id.nav_devices); break;
                    case 1: bottomNav.setSelectedItemId(R.id.nav_chat); break;
                    case 2: bottomNav.setSelectedItemId(R.id.nav_commands); break;
                }
            }
        });

        // Setup navigation drawer
        navigationView.setNavigationItemSelectedListener(item -> {
            drawerLayout.closeDrawer(GravityCompat.START);
            int itemId = item.getItemId();
            if (itemId == R.id.nav_settings) {
                showConnectDialog();
            } else if (itemId == R.id.nav_about) {
                showAboutDialog();
            }
            return true;
        });

        // Listen for device count updates
        wsManager.addListener(new WebSocketManager.WebSocketListener() {
            @Override
            public void onDeviceListUpdated(List<DeviceInfo> devices) {
                runOnUiThread(() -> {
                    int count = 0;
                    for (DeviceInfo d : devices) {
                        if (!d.getDeviceId().equals(wsManager.getDeviceId())) {
                            count++;
                        }
                    }
                    deviceCountText.setText(count + " device" + (count != 1 ? "s" : ""));
                });
            }
        });

        // Show connect dialog on start if not connected
        if (!wsManager.isConnected()) {
            showConnectDialog();
        }
    }

    private void setupViewPager() {
        List<Fragment> fragments = new ArrayList<>();
        fragments.add(new DevicesFragment());
        fragments.add(new ChatFragment());
        fragments.add(new CommandsFragment());

        ViewPagerAdapter adapter = new ViewPagerAdapter(this, fragments);
        viewPager.setAdapter(adapter);
        viewPager.setOffscreenPageLimit(2);
    }

    private void showConnectDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this, R.style.ThemeOverlay_MaterialComponents_Dialog);
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_connect, null);
        builder.setView(dialogView);

        TextInputEditText serverInput = dialogView.findViewById(R.id.server_address_input);
        TextInputEditText nameInput = dialogView.findViewById(R.id.device_name_input);

        // Set default name to device model
        nameInput.setText(android.os.Build.MODEL);

        AlertDialog dialog = builder.create();
        dialog.setCancelable(false);

        dialogView.findViewById(R.id.btn_connect).setOnClickListener(v -> {
            String address = serverInput.getText().toString().trim();
            String name = nameInput.getText().toString().trim();

            if (address.isEmpty()) {
                Toast.makeText(this, "Please enter a server address", Toast.LENGTH_SHORT).show();
                return;
            }
            if (name.isEmpty()) {
                name = "Moony-" + android.os.Build.MODEL;
            }

            statusText.setText("Connecting...");
            statusIndicator.setBackgroundResource(R.drawable.circle_indicator);
            statusIndicator.getBackground().setTint(0xFFF59E0B); // Yellow

            wsManager.connect(address, name, new WebSocketManager.ConnectionListener() {
                @Override
                public void onConnected() {
                    runOnUiThread(() -> {
                        statusText.setText("Connected to " + address);
                        statusIndicator.getBackground().setTint(0xFF10B981); // Green
                        dialog.dismiss();
                    });
                }

                @Override
                public void onDisconnected() {
                    runOnUiThread(() -> {
                        statusText.setText("Disconnected");
                        statusIndicator.getBackground().setTint(0xFFEF4444); // Red
                    });
                }

                @Override
                public void onError(String error) {
                    runOnUiThread(() -> {
                        statusText.setText("Error: " + error);
                        statusIndicator.getBackground().setTint(0xFFEF4444); // Red
                        Toast.makeText(MainActivity.this,
                                "Connection failed: " + error, Toast.LENGTH_LONG).show();
                    });
                }
            });
        });

        dialog.show();
    }

    private void showAboutDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("🌙 Moony");
        builder.setMessage("Moony IoT Control v1.0\n\n" +
                "A beautiful Android app to control IoT devices " +
                "connected to the IoT Control Server.\n\n" +
                "Features:\n" +
                "• Real-time device monitoring\n" +
                "• Chat with connected devices\n" +
                "• Send commands (ON/OFF/RESTART)\n" +
                "• Custom command support\n" +
                "• Moon-themed dark UI");
        builder.setPositiveButton("OK", null);
        builder.show();
    }

    @Override
    public void onBackPressed() {
        if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
            drawerLayout.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        wsManager.disconnect();
    }

    private static class ViewPagerAdapter extends FragmentStateAdapter {
        private List<Fragment> fragments;

        ViewPagerAdapter(@NonNull Fragment fragment,
                         List<Fragment> fragments) {
            super(fragment);
            this.fragments = fragments;
        }

        @NonNull
        @Override
        public Fragment createFragment(int position) {
            return fragments.get(position);
        }

        @Override
        public int getItemCount() {
            return fragments.size();
        }
    }
}